import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../utils/api";
import { useCallback } from "react";


const AuthContext = createContext();

// Custom Auth Context Hook
export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('evangadi_token'));
    const [loading, setLoading] = useState(true);
    const [tokenExpired, setTokenExpired] = useState(false);      //Tracks token expiration state


    //Centralized logout function
    const performLogout = useCallback((reason = 'manual') => {   

        
        setUser(null);
        setToken(null);
        setTokenExpired(false);
        localStorage.removeItem('evangadi_token');
        localStorage.removeItem('evangadi_user');
        
        //message based on reason
        if (reason === 'token-expired') {
            
            console.warn('Session expired. Please login again.');   
        }
    }, []);



    // Listening for token expiration events from API interceptor
    useEffect(() => {
        const handleTokenExpired = (event) => {
            const { reason, message } = event.detail;
            console.warn('Token expired event received:', reason, message);
            
            setTokenExpired(true);
            performLogout('token-expired');
        };

        // Adding event listener for token expiration
        window.addEventListener('token-expired', handleTokenExpired);


        //cleanUp
        return () => {
            window.removeEventListener('token-expired', handleTokenExpired);
        };
    }, [performLogout]);



    // Checking if user is authenticated on app load(page reload)
    useEffect(() => {
        
        const checkAuth = async () => {


            //localStorage only stores strings(Retrieves previously saved user info and token from localStorage(if logged in) )
            const storedToken = localStorage.getItem('evangadi_token');   
            const storedUser = localStorage.getItem('evangadi_user');

            if (storedToken && storedUser) {
                try{

                    //Setting user data immediately for better UX
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setToken(storedToken);
  

                    //Then Verifying user(and updating user data)
                    const res = await authAPI.checkUser();
                    
                    if (res.data.success) {
                        setUser(res.data.user);
                        
                    }else{
                    console.warn('Server rejected token during auth check');  //Server responding token is invalid
                    performLogout('invalid-token');
                    }

                }catch (err) {
                    console.error('Auth check failed:', err);
                   
                    const errorResponse = err.response?.data;

                     if (errorResponse?.shouldLogout || 
                        errorResponse?.error === 'TOKEN_EXPIRED' ||
                        errorResponse?.error === 'INVALID_TOKEN' ||
                        err.response?.status === 401 || 
                        err.response?.status === 403) {
                        // Token is definitely invalid/expired
                        performLogout('token-expired');
                    } else {
                        // Network error or server error - keep user logged in locally
                        console.warn('Network error during auth check, keeping user logged in locally');
                    }
                }
            }
             
            //Always Stop loading after check
            setLoading(false);

        }

        checkAuth();

    }, [performLogout])


    //Login Function
    const loginUser = async (credentials) => {
        try{

            setLoading(true);
            setTokenExpired(false);


            const res = await authAPI.login(credentials);
        
            const {user: userData, token: authToken} = res.data;
            

            setUser(userData);
            setToken(authToken);

            localStorage.setItem('evangadi_token', authToken);
            localStorage.setItem('evangadi_user', JSON.stringify(userData));   

            return {success: true};


        }catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.error || 'Login failed. Please try again later';
            return { success: false, error: errorMessage };

        }finally{
            setLoading(false)
        }
    }


    //Registration Function
    const registerUser = async (userData) => {

        try{
            setLoading(true);

            const res = await authAPI.register(userData);
          
            const {user: newUser, token: authToken} = res.data;

            return {success: true};

        }catch (err) {

            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.error || 'Registration failed. Please try again later.';
        
            return { success: false, error: errorMessage };

        }finally{
            setLoading(false)
        }
    }


    //Logout Function
    const logout = useCallback(() => {   //remembering logout so that it doesn't get recreated very render 
        performLogout('manual');
    }, [performLogout]);

  const value = {
    user,
    token,
    loading,
    tokenExpired,
    loginUser,
    registerUser,
    logout,
    isAuthenticated: user !== null && token !== null,
    performLogout
  };




  return (

    <AuthContext.Provider   value={value}>
        {children}
    </AuthContext.Provider>
  )
}
import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../utils/api";


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


    // Checking if user is authenticated on app load(page reload)
    useEffect(() => {
        
        const checkAuth = async () => {


            //localStorage only stores strings(Retrieves previously saved user info and token from localStorage(if logged in) )
            const storedToken = localStorage.getItem('evangadi_token');   
            const storedUser = localStorage.getItem('evangadi_user');

            if (storedToken && storedUser) {
                try{

                    const res = await authAPI.checkUser();
                    // console.log(res.data)
                    
                    if (res.data.success) {
                        setUser(JSON.parse(storedUser));
                        setToken(storedToken);
                    }else{
                        localStorage.removeItem('evangadi_token');
                        localStorage.removeItem('evangadi_user');
                    }

                }catch (err) {
                    console.error('Auth check failed:', err);
                    localStorage.removeItem('evangadi_token');
                    localStorage.removeItem('evangadi_user');
                }
            }
             
            //Always Stop loading after check
            setLoading(false);

        }

        checkAuth();

    }, [])


    //Login Function
    const loginUser = async (credentials) => {
        try{
            const res = await authAPI.login(credentials);

            // console.log(res);

            const {user: userData, token: authToken} = res.data;
            

            setUser(userData);
            setToken(authToken);

            localStorage.setItem('evangadi_token', authToken);
            localStorage.setItem('evangadi_user', JSON.stringify(userData));   

            return {success: true};


        }catch (err) {

            const errorMessage = err.response?.data?.error || 'Login failed. Please try again later';
            return { success: false, error: errorMessage };

        }
    }


    //Registration Function
    const registerUser = async (userData) => {

        try{
            const res = await authAPI.register(userData);

            // console.log(res);

            const {user: newUser, token: authToken} = res.data;

            setUser(newUser);
            setToken(authToken);

            localStorage.setItem('evangadi_token', authToken);
            localStorage.setItem('evangadi_user', JSON.stringify(newUser));

            return {success: true};

        }catch (err) {

            const errorMessage = err.response?.data?.error || 'Registration failed. Please try again later.';
            console.log(err.response)
            return { success: false, error: errorMessage };

        }
    }


    //Logout Function

    const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('evangadi_token');
    localStorage.removeItem('evangadi_user');
  };

  const value = {
    user,
    token,
    loading,
    loginUser,
    registerUser,
    logout,
    isAuthenticated: user !== null && token !== null,
  };




  return (

    <AuthContext.Provider   value={value}>
        {children}
    </AuthContext.Provider>
  )
}
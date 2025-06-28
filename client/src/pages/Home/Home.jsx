import React, { useEffect, useState, useRef } from "react";
import styles from "./Home.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { questionsAPI } from "../../utils/api";
import { Alert, Button, Spinner, Form, InputGroup } from "react-bootstrap";
import { FaSearch, FaTimes } from "react-icons/fa";
import QuestionInfo from "./QuestionInfo";
import Pagination from "../../Components/Pagination/Pagination.jsx";
import quotes from "inspirational-quotes";

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); //state management for search
  const [isSearching, setIsSearching] = useState(false);
  const [paginationData, setPaginationData] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuestions: 0,
    questionsPerPage: 4,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [searchType, setSearchType] = useState("title"); // NEW: search type
  const [quote, setQuote] = useState({ text: "", author: "" });

  const navigate = useNavigate();
  const { user } = useAuth();
  const searchInputRef = useRef(); //state management for search

  // Getting the value of the page parameter from URL query string Using useSearchParams hook
  const [searchParams, setSearchParams] = useSearchParams();

  //Getting The Current Page From the URL Parameters
  const currentPage = parseInt(searchParams.get("page")) || 1;
  const questionsPerPage = 4; //fixed limit

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const userKey = user.user_id || user.username || "guest";
    const storageKey = `quoteOfTheDay_${userKey}`;
    const stored = localStorage.getItem(storageKey);
    let quoteObj = null;
    if (stored) {
      try {
        quoteObj = JSON.parse(stored);
      } catch (e) {
        quoteObj = null;
      }
    }
    if (quoteObj && quoteObj.date === today) {
      setQuote({ text: quoteObj.text, author: quoteObj.author });
    } else {
      const newQuote = quotes.getQuote();
      setQuote(newQuote);
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          text: newQuote.text,
          author: newQuote.author,
          date: today,
        })
      );
    }
  }, [user]);

  useEffect(() => {
    const urlSearchQuery = searchParams.get("search") || "";
    const urlSearchType = searchParams.get("type") || "title";
    setSearchQuery(urlSearchQuery);
    setSearchType(urlSearchType);
    fetchQuestions(
      currentPage,
      questionsPerPage,
      urlSearchQuery,
      urlSearchType
    );
  }, [currentPage]);

  const fetchQuestions = async (
    page = 1,
    limit = 4,
    search = "",
    type = "title"
  ) => {
    //Getting Questions With search params
    try {
      setLoading(true);
      setError("");

      const response = await questionsAPI.getAllQuestions(
        page,
        limit,
        search,
        type
      );

      if (response.data.success) {
        setQuestions(response.data.data.questions);
        setPaginationData(response.data.data.pagination);
      } else {
        setError(response.data.error || "Failed to fetch Questions");
      }
    } catch (err) {
      setError("Failed to fetch questions. Please try again later");
      console.error("Error fetching questions", err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // Handling search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handling search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery.trim());
  };

  // Performing search function
  const performSearch = (query, type = searchType) => {
    //(Takes the search text = query)
    setIsSearching(true);
    const trimmedQuery = query.trim(); //cleans whitespaces from the search query

    // Updating URL with search parameters

    const newParams = { page: "1", type }; //New object to hold URL Params and setting every new search to start from page 1

    if (trimmedQuery) {
      newParams.search = trimmedQuery; //If there is content in the search input adding the search query to URL Params
    }
    setSearchParams(newParams); //Updating the URL Without Refreshing the Page

    // Fetch questions with search query
    fetchQuestions(1, questionsPerPage, trimmedQuery, type);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchType("title");
    setSearchParams({ page: "1", type: "title" });
    fetchQuestions(1, questionsPerPage, "", "title");
    searchInputRef.current?.focus();
  };

  // Handle page navigation with search
  const handlePageChange = (newPage) => {
    const params = { page: newPage.toString(), type: searchType };
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskQuestion = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/askQuestion");
  };

  // Handle question deletion
  const handleQuestionDeleted = (deletedQuestionId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter(
        (question) => question.question_id !== deletedQuestionId
      )
    );

    setPaginationData((prevData) => ({
      ...prevData,
      totalQuestions: prevData.totalQuestions - 1,
      totalPages: Math.ceil(
        (prevData.totalQuestions - 1) / prevData.questionsPerPage
      ),
    }));

    if (questions.length === 1 && currentPage > 1) {
      handlePageChange(currentPage - 1);
    } else {
      fetchQuestions(currentPage, questionsPerPage, searchQuery, searchType);
    }
  };

  if (loading && !isSearching) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="warning" />
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeContent}>
        {/* Top Section with Ask Question Button and Welcome */}
        <div className={styles.topSection}>
          <div
            style={{
              minWidth: 140,
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              className={styles.askQuestionBtn}
              onClick={handleAskQuestion}
            >
              Ask Question
            </Button>
          </div>
          <div className={styles.wordOfTheDaySection}>
            <h3 className={styles.wordOfTheDayTitle}>✨ Quote of the Day</h3>
            <div className={styles.wordOfTheDayQuote}>
              “{quote.text}”<br />
              <span style={{ fontWeight: 600, color: "#653cb1" }}>
                — {quote.author}
              </span>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className={styles.questionsSection}>
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <Form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <InputGroup>
                <Form.Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className={styles.searchTypeSelect}
                  style={{ maxWidth: 120 }}
                >
                  <option value="title">Title</option>
                  <option value="question">Question</option>
                  <option value="tag">Tag</option>
                </Form.Select>
                <Form.Control
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search questions by title, content, or tag..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    className={styles.clearButton}
                    title="Clear search"
                  >
                    <FaTimes />
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="outline-primary"
                  disabled={isSearching}
                  className={styles.searchButton}
                  title="Search questions"
                >
                  {isSearching ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <FaSearch />
                  )}
                </Button>
              </InputGroup>
            </Form>
          </div>

          <div className={styles.questionsSectionHeader}>
            <h2 className={styles.questionsTitle}>
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Questions"}
            </h2>

            {/* Display current page info */}
            {paginationData.totalQuestions > 0 && (
              <div className={styles.pageInfo}>
                Page {paginationData.currentPage} of {paginationData.totalPages}
              </div>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && (
            <div className={styles.searchResultsInfo}>
              {paginationData.totalQuestions > 0 ? (
                <p>
                  Found {paginationData.totalQuestions} question(s) matching
                  your search.
                </p>
              ) : (
                <p>
                  No questions found matching your search. Try different
                  keywords.
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="danger" className={styles.errorAlert}>
              {error}
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={() =>
                  fetchQuestions(
                    currentPage,
                    questionsPerPage,
                    searchQuery,
                    searchType
                  )
                }
              >
                Retry
              </Button>
            </Alert>
          )}

          {/* Questions List */}
          <div className={styles.questionsList}>
            {loading && isSearching ? (
              <div className={styles.searchLoadingContainer}>
                <Spinner animation="border" variant="primary" />
                <p>Searching questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className={styles.noQuestions}>
                {searchQuery ? (
                  <>
                    <h4>No questions found</h4>
                    <p>
                      Try adjusting your search terms or browse all questions.
                    </p>
                    <div className={styles.noQuestionsActions}>
                      <Button
                        variant="outline-primary"
                        onClick={clearSearch}
                        className="me-2"
                      >
                        Clear Search
                      </Button>
                      <Button variant="primary" onClick={handleAskQuestion}>
                        Ask a Question
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <h4>No questions available</h4>
                    <p>Be the first to ask a question!</p>
                    <Button
                      variant="primary"
                      onClick={handleAskQuestion}
                      className="mt-2"
                    >
                      Ask the First Question
                    </Button>
                  </>
                )}
              </div>
            ) : (
              questions.map((question) => (
                <QuestionInfo
                  key={question.question_id}
                  username={question.username}
                  title={question.title}
                  userId={question.user_id}
                  questionId={question.question_id}
                  onQuestionDeleted={handleQuestionDeleted}
                  viewCount={question.view_count || 0}
                  likeCount={question.like_count || 0}
                />
              ))
            )}
          </div>

          {/* Pagination Component */}
          {paginationData.totalPages > 1 && (
            <Pagination
              currentPage={paginationData.currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
              totalItems={paginationData.totalQuestions}
              itemsPerPage={paginationData.questionsPerPage}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

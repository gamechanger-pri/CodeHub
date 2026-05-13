import React from "react";
import "./css/index.css";
import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, logout } from "../../feature/userSlice";
import axios from "../../api/axios";

function Header() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const suggestionsRef = React.useRef(null);
  const debounceRef = React.useRef(null);

  const location = useLocation();

  // Fetch suggestions
  const fetchSuggestions = React.useCallback(async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`/question/suggestions?q=${encodeURIComponent(query)}`);
      setSuggestions(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveIndex(-1);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        // Navigate to selected suggestion
        navigate(`/question?q=${suggestions[activeIndex]._id}`);
        setShowDropdown(false);
        setSearchTerm("");
        setSuggestions([]);
      } else if (searchTerm.trim()) {
        // Navigate to search results
        navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
        setShowDropdown(false);
      } else {
        // Search cleared - navigate to home to show all questions
        navigate("/");
        setShowDropdown(false);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (questionId, title) => {
    navigate(`/question?q=${questionId}`);
    setShowDropdown(false);
    setSearchTerm("");
    setSuggestions([]);
  };

  // Handle view all results
  const handleViewAllResults = () => {
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync search term with URL params (only on home page, not on question pages)
  React.useEffect(() => {
    if (location.pathname === "/") {
      setSearchTerm(searchParams.get("q") || "");
    } else {
      // Clear search term when on other pages (like question detail page)
      setSearchTerm("");
    }
  }, [searchParams, location.pathname]);

  // Cleanup debounce on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Responsive handling
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function stringToColor(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).slice(-2);
    }
    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: name ? stringToColor(name) : "rgba(255,255,255,0.8)",
      },
      children: name
        ? `${name.split(" ")[0][0]}${name.split(" ")[1]?.[0] || ""}`
        : "U",
    };
  }

  return (
    <header>
      <div className="header-container">
        <div className="header-left">
          <Link to="/">
            <img
              src="https://cdn.sstatic.net/Sites/stackoverflow/company/img/logos/so/so-logo.png"
              alt="logo"
            />
          </Link>

        </div>

        <div className="header-middle">
          <div className="header-search-container" ref={suggestionsRef}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchTerm.trim() && setShowDropdown(true)}
            />
            {showDropdown && (
              <div className="search-suggestions-dropdown">
                {suggestions.length > 0 ? (
                  <>
                    {suggestions.map((item, index) => (
                      <div
                        key={item._id}
                        className={`suggestion-item ${index === activeIndex ? "active" : ""}`}
                        onClick={() => handleSuggestionClick(item._id)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <div className="suggestion-title">{item.title}</div>
                        {item.tags && item.tags.length > 0 && (
                          <div className="suggestion-tags">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="suggestion-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div
                      className="suggestion-footer"
                      onClick={handleViewAllResults}
                    >
                      View all results for "{searchTerm}"
                    </div>
                  </>
                ) : searchTerm.trim() ? (
                  <div className="suggestion-empty">No results found</div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="header-right-container">
            {isMobile && <SearchIcon />}

            <Tooltip title={user?.name || user?.displayName || (user?.email ? user.email.split('@')[0] : 'User')}>
              <Avatar
                style={{ cursor: "pointer" }}
                {...stringAvatar(user?.displayName || user?.name || (user?.email ? user.email.split('@')[0] : 'User'))}
              />
            </Tooltip>
            <LogoutIcon
              onClick={async () => {
                localStorage.removeItem("token");
                dispatch(logout());
                navigate("/auth");
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

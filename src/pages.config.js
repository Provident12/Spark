/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard';
import Applications from './pages/Applications';
import Landing from './pages/Landing';
import ManageApplicants from './pages/ManageApplicants';
import OpportunityDetail from './pages/OpportunityDetail';
import OrgDashboard from './pages/OrgDashboard';
import OrgRegistration from './pages/OrgRegistration';
import PostOpportunity from './pages/PostOpportunity';
import Profile from './pages/Profile';
import ProfileBuilder from './pages/ProfileBuilder';
import ReviewOpportunity from './pages/ReviewOpportunity';
import ReviewOrganization from './pages/ReviewOrganization';
import Saved from './pages/Saved';
import Search from './pages/Search';
import Settings from './pages/Settings';
import StudentHome from './pages/StudentHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "Applications": Applications,
    "Landing": Landing,
    "ManageApplicants": ManageApplicants,
    "OpportunityDetail": OpportunityDetail,
    "OrgDashboard": OrgDashboard,
    "OrgRegistration": OrgRegistration,
    "PostOpportunity": PostOpportunity,
    "Profile": Profile,
    "ProfileBuilder": ProfileBuilder,
    "ReviewOpportunity": ReviewOpportunity,
    "ReviewOrganization": ReviewOrganization,
    "Saved": Saved,
    "Search": Search,
    "Settings": Settings,
    "StudentHome": StudentHome,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};
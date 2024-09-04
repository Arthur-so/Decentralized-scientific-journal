import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import UserPostPage from './pages/userPostPage/UserPostPage';
// import UserReviewPage from './pages/userReviewPage/UserReviewPage';
import ReviewArticlePage from './pages/reviewArticle/ReviewArticlePage';
import AddReviewerPage from './pages/addReviewer/AddReviewerPage';
import CategoryPage from './pages/categoryPage/CategoryPage';
import PreviewsPage from './pages/previewsPage/PreviewsPage';
import PurchasedArticlesPage from './pages/purchasedArticlesPage/PurchasedArticlesPage';
import ErrorPage from './pages/errorPage/ErrorPage';

const router = createBrowserRouter([
// {
//   path: "/",
//   element: <HomePage/> 
// },
{
  path: "/",
  element: <PreviewsPage/> 
},
{
  path: "/send",
  element: <UserPostPage/> 
},
{
  path: "/articles",
  element: <PurchasedArticlesPage/> 
},
{
  path: "/addreviewer",
  element: <AddReviewerPage/> 
},
{
  path: "/review",
  element: <ReviewArticlePage/> 
},
{
  path: "/category/:id",
  element: <CategoryPage/> 
},
{
  errorElement: <ErrorPage/>
},
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

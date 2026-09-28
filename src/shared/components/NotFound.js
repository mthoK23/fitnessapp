import React from "react";
import {Link} from "react-router-dom";

function NotFound(){
    return(
        <main>
            <h1>404</h1>
            <h2>Page not found</h2>
            <Link to="/">Go back Home</Link>
        </main>
    );

}

export default NotFound;
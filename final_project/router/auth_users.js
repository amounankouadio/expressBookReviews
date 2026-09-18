const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    const matching = users.filter((user) => user.username === username);
    return matching.length === 0;
};

const authenticatedUser = (username, password) => {
    const matching = users.filter(
        (user) => user.username === username && user.password === password
    );
    return matching.length > 0;
};

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: username and password required." });
    }
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    }
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found for the given ISBN." });
    }
    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required." });
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: `The review for the book with ISBN ${isbn} has been added/updated.`,
        reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found for the given ISBN." });
    }
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review by this user for this book." });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({
        message: `Review for the ISBN ${isbn} posted by the user ${username} deleted.`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;

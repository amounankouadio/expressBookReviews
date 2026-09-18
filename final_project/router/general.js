const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (!isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: "Book not found for the given ISBN." });
});

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const result = [];
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
            result.push({ isbn: isbn, title: books[isbn].title, reviews: books[isbn].reviews });
        }
    });
    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
    }
    return res.status(404).json({ message: "No books found for the given author." });
});

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const result = [];
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
            result.push({ isbn: isbn, author: books[isbn].author, reviews: books[isbn].reviews });
        }
    });
    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
    }
    return res.status(404).json({ message: "No books found for the given title." });
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found for the given ISBN." });
    }
    if (Object.keys(book.reviews).length === 0) {
        return res.status(200).json({ message: "No reviews found for this book." });
    }
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
});

const BASE_URL = "http://localhost:5000";

public_users.get('/async/books', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

public_users.get('/async/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then((response) => res.status(200).send(JSON.stringify(response.data, null, 4)))
        .catch((error) => res.status(404).json({ message: "Book not found for the given ISBN." }));
});

public_users.get('/async/author/:author', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: "No books found for the given author." });
    }
});

public_users.get('/async/title/:title', async function (req, res) {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(404).json({ message: "No books found for the given title." });
    }
});

module.exports.general = public_users;

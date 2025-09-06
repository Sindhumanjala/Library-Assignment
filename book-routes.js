const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { adminOnly, memberOrAdmin } = require('../middleware/roleAuth');
const {
  addBook,
  getAllBooks,
  getAvailableBooks,
  getBookById,
  borrowBook,
  returnBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated book ID
 *         title:
 *           type: string
 *           description: Book title
 *         author:
 *           type: string
 *           description: Book author
 *         isbn:
 *           type: string
 *           description: Unique ISBN number
 *         availabilityStatus:
 *           type: boolean
 *           description: Whether the book is available for borrowing
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - isbn
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               availabilityStatus:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Book added successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Book with ISBN already exists
 */
router.post('/', auth, adminOnly, addBook);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books with optional filtering
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title/author
 *       - in: query
 *         name: searchBy
 *         schema:
 *           type: string
 *           enum: [title, author, both]
 *           default: both
 *         description: Search in title, author, or both
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalBooks:
 *                       type: integer
 */
router.get('/', getAllBooks);

/**
 * @swagger
 * /api/books/available:
 *   get:
 *     summary: Get only available books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Available books retrieved successfully
 */
router.get('/available', getAvailableBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a specific book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book retrieved successfully
 *       404:
 *         description: Book not found
 */
router.get('/:id', getBookById);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               availabilityStatus:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Book not found
 */
router.put('/:id', auth, adminOnly, updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book (Admin only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Book not found
 */
router.delete('/:id', auth, adminOnly, deleteBook);

/**
 * @swagger
 * /api/books/{id}/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book borrowed successfully
 *       404:
 *         description: Book not found
 *       409:
 *         description: Book not available or already borrowed by user
 */
router.post('/:id/borrow', auth, memberOrAdmin, borrowBook);

/**
 * @swagger
 * /api/books/{id}/return:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book returned successfully
 *       404:
 *         description: No active borrow record found
 */
router.post('/:id/return', auth, memberOrAdmin, returnBook);

module.exports = router;
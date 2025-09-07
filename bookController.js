const { PrismaClient } = require('@prisma/client');
const { bookValidation, borrowValidation } = require('../utils/validation');
const { checkBookExists, checkBookAvailability, updateBookAvailability } = require('../utils/bookUtils');

const prisma = new PrismaClient();

/**
 * Add a new book (Admin only)
 * @route POST /api/books
 * @access Protected (Admin)
 */
const addBook = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = bookValidation.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          code: 'VALIDATION_ERROR'
        }
      });
    }

    const { title, author, isbn, availabilityStatus = true } = value;

    // Check if book with same ISBN already exists
    const existingBook = await prisma.book.findUnique({
      where: { isbn }
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Book with this ISBN already exists',
          code: 'BOOK_EXISTS'
        }
      });
    }

    // Create new book
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        availabilityStatus
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      book: newBook
    });

  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while adding book',
        code: 'ADD_BOOK_ERROR'
      }
    });
  }
};

/**
 * Get all books with optional filtering
 * @route GET /api/books
 * @access Public
 */
const getAllBooks = async (req, res) => {
  try {
    const { available, page = 1, limit = 10, search, searchBy = 'both' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where condition
    let whereCondition = {};
    
    if (available !== undefined) {
      whereCondition.availabilityStatus = available === 'true';
    }

    if (search) {
      const searchConditions = [];
      if (searchBy === 'title' || searchBy === 'both') {
        searchConditions.push({
          title: {
            contains: search,
            mode: 'insensitive'
          }
        });
      }
      if (searchBy === 'author' || searchBy === 'both') {
        searchConditions.push({
          author: {
            contains: search,
            mode: 'insensitive'
          }
        });
      }
      
      whereCondition.OR = searchConditions;
    }

    // Get books with pagination
    const [books, totalBooks] = await Promise.all([
      prisma.book.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.book.count({
        where: whereCondition
      })
    ]);

    const totalPages = Math.ceil(totalBooks / take);

    res.status(200).json({
      success: true,
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBooks,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while fetching books',
        code: 'FETCH_BOOKS_ERROR'
      }
    });
  }
};

/**
 * Get available books only
 * @route GET /api/books/available
 * @access Public
 */
const getAvailableBooks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [books, totalBooks] = await Promise.all([
      prisma.book.findMany({
        where: {
          availabilityStatus: true
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.book.count({
        where: {
          availabilityStatus: true
        }
      })
    ]);

    res.status(200).json({
      success: true,
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBooks / take),
        totalBooks
      }
    });

  } catch (error) {
    console.error('Get available books error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while fetching available books',
        code: 'FETCH_AVAILABLE_BOOKS_ERROR'
      }
    });
  }
};

/**
 * Get single book by ID
 * @route GET /api/books/:id
 * @access Public
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrowRecords: {
          where: { status: 'BORROWED' },
          include: {
            user: {
              select: {
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      book
    });

  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while fetching book',
        code: 'FETCH_BOOK_ERROR'
      }
    });
  }
};

/**
 * Borrow a book
 * @route POST /api/books/:id/borrow
 * @access Protected
 */
const borrowBook = async (req, res) => {
  try {

    const { id: bookId } = req.params;
    const userId = req.user.userId;

    // Check if book exists and is available
    const exists = await checkBookExists(bookId);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND'
        }
      });
    }

    const isAvailable = await checkBookAvailability(bookId);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Book is currently not available',
          code: 'BOOK_NOT_AVAILABLE'
        }
      });
    }

    // Check if user already has this book borrowed
    const existingBorrow = await prisma.borrowRecord.findFirst({
      where: {
        userId,
        bookId,
        status: 'BORROWED'
      }
    });

    if (existingBorrow) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'You have already borrowed this book',
          code: 'ALREADY_BORROWED'
        }
      });
    }


    // Create borrow record and update book availability
    const result = await prisma.$transaction([
      prisma.borrowRecord.create({
        data: {
          userId,
          bookId,
          status: 'BORROWED'
        }
      }),
      updateBookAvailability(bookId, false)
    ]);

    res.status(200).json({
      success: true,
      message: 'Book borrowed successfully',
      borrowRecord: result[0]
    });

  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while borrowing book',
        code: 'BORROW_BOOK_ERROR'
      }
    });
  }
};

/**
 * Return a book
 * @route POST /api/books/:id/return
 * @access Protected
 */
const returnBook = async (req, res) => {
  try {
    const { id: bookId } = req.params;
    const userId = req.user.userId;

    // Find the borrow record
    const borrowRecord = await prisma.borrowRecord.findFirst({
      where: {
        userId,
        bookId,
        status: 'BORROWED'
      }
    });

    if (!borrowRecord) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No active borrow record found for this book',
          code: 'BORROW_RECORD_NOT_FOUND'
        }
      });
    }


    // Update borrow record and book availability
    const result = await prisma.$transaction([
      prisma.borrowRecord.update({
        where: { id: borrowRecord.id },
        data: {
          status: 'RETURNED',
          returnDate: new Date()
        }
      }),
      updateBookAvailability(bookId, true)
    ]);

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      borrowRecord: result[0]
    });

  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while returning book',
        code: 'RETURN_BOOK_ERROR'
      }
    });
  }
};

/**
 * Update book (Admin only)
 * @route PUT /api/books/:id
 * @access Protected (Admin)
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, isbn, availabilityStatus } = req.body;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND'
        }
      });
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(isbn && { isbn }),
        ...(availabilityStatus !== undefined && { availabilityStatus })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook
    });

  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while updating book',
        code: 'UPDATE_BOOK_ERROR'
      }
    });
  }
};

/**
 * Delete book (Admin only)
 * @route DELETE /api/books/:id
 * @access Protected (Admin)
 */
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND'
        }
      });
    }

    // Delete book (cascade will handle borrow records)
    await prisma.book.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error while deleting book',
        code: 'DELETE_BOOK_ERROR'
      }
    });
  }
};

module.exports = {
  addBook,
  getAllBooks,
  getAvailableBooks,
  getBookById,
  borrowBook,
  returnBook,
  updateBook,
  deleteBook
};

// Library Management System JavaScript

// Mock Data (from provided JSON)
const MOCK_DATA = {
  users: [
    {
      "id": "1",
      "username": "admin",
      "email": "admin@library.com",
      "password": "Admin123!",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2", 
      "username": "john_doe",
      "email": "john@example.com",
      "password": "User123!",
      "role": "MEMBER",
      "createdAt": "2024-01-15T00:00:00Z"
    },
    {
      "id": "3",
      "username": "jane_smith", 
      "email": "jane@example.com",
      "password": "User123!",
      "role": "MEMBER",
      "createdAt": "2024-02-01T00:00:00Z"
    }
  ],
  books: [
    {
      "id": "1",
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "978-0-06-112008-4",
      "availabilityStatus": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2", 
      "title": "1984",
      "author": "George Orwell",
      "isbn": "978-0-452-28423-4",
      "availabilityStatus": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-02-15T00:00:00Z"
    },
    {
      "id": "3",
      "title": "Pride and Prejudice",
      "author": "Jane Austen", 
      "isbn": "978-0-14-143951-8",
      "availabilityStatus": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "4",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "availabilityStatus": true,
      "createdAt": "2024-01-05T00:00:00Z",
      "updatedAt": "2024-01-05T00:00:00Z"
    },
    {
      "id": "5",
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "isbn": "978-0-439-70818-8",
      "availabilityStatus": false,
      "createdAt": "2024-01-10T00:00:00Z",
      "updatedAt": "2024-03-01T00:00:00Z"
    },
    {
      "id": "6",
      "title": "The Catcher in the Rye",
      "author": "J.D. Salinger",
      "isbn": "978-0-316-76948-0",
      "availabilityStatus": true,
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    },
    {
      "id": "7",
      "title": "Lord of the Flies",
      "author": "William Golding",
      "isbn": "978-0-571-05686-2",
      "availabilityStatus": true,
      "createdAt": "2024-02-01T00:00:00Z",
      "updatedAt": "2024-02-01T00:00:00Z"
    },
    {
      "id": "8",
      "title": "The Hobbit",
      "author": "J.R.R. Tolkien",
      "isbn": "978-0-547-92822-7",
      "availabilityStatus": false,
      "createdAt": "2024-02-10T00:00:00Z",
      "updatedAt": "2024-03-15T00:00:00Z"
    }
  ],
  borrowRecords: [
    {
      "id": "1",
      "userId": "2",
      "bookId": "2", 
      "borrowDate": "2024-02-15T00:00:00Z",
      "returnDate": null,
      "status": "BORROWED"
    },
    {
      "id": "2",
      "userId": "3",
      "bookId": "5",
      "borrowDate": "2024-03-01T00:00:00Z", 
      "returnDate": null,
      "status": "BORROWED"
    },
    {
      "id": "3",
      "userId": "2",
      "bookId": "8",
      "borrowDate": "2024-03-15T00:00:00Z",
      "returnDate": null,
      "status": "BORROWED"
    },
    {
      "id": "4",
      "userId": "2",
      "bookId": "1",
      "borrowDate": "2024-01-20T00:00:00Z",
      "returnDate": "2024-02-10T00:00:00Z",
      "status": "RETURNED"
    }
  ]
};

// Application State
let appState = {
  currentUser: null,
  books: [...MOCK_DATA.books],
  users: [...MOCK_DATA.users],
  borrowRecords: [...MOCK_DATA.borrowRecords],
  currentView: 'books',
  filters: {
    search: '',
    availability: ''
  }
};

// Utility Functions
function showLoading() {
  document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-spinner').classList.add('hidden');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    if (container.contains(toast)) {
      container.removeChild(toast);
    }
  }, 4000);
}

function simulateApiDelay() {
  return new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function generateId() {
  return (Date.now() + Math.random()).toString();
}

// Authentication Functions
async function login(email, password) {
  showLoading();
  await simulateApiDelay();
  
  const user = appState.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    appState.currentUser = user;
    hideLoading();
    return { success: true, user };
  } else {
    hideLoading();
    return { success: false, error: 'Invalid email or password' };
  }
}

async function register(userData) {
  showLoading();
  await simulateApiDelay();
  
  const existingUser = appState.users.find(u => u.email === userData.email);
  
  if (existingUser) {
    hideLoading();
    return { success: false, error: 'User already exists with this email' };
  }
  
  const newUser = {
    id: generateId(),
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    createdAt: new Date().toISOString()
  };
  
  appState.users.push(newUser);
  appState.currentUser = newUser;
  
  hideLoading();
  return { success: true, user: newUser };
}

function logout() {
  appState.currentUser = null;
  showAuthPage();
}

// Book Functions
function getFilteredBooks() {
  let filteredBooks = [...appState.books];
  
  if (appState.filters.search) {
    const search = appState.filters.search.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(search) ||
      book.author.toLowerCase().includes(search)
    );
  }
  
  if (appState.filters.availability) {
    if (appState.filters.availability === 'available') {
      filteredBooks = filteredBooks.filter(book => book.availabilityStatus);
    } else if (appState.filters.availability === 'borrowed') {
      filteredBooks = filteredBooks.filter(book => !book.availabilityStatus);
    }
  }
  
  return filteredBooks;
}

async function borrowBook(bookId) {
  showLoading();
  await simulateApiDelay();
  
  const book = appState.books.find(b => b.id === bookId);
  if (!book || !book.availabilityStatus) {
    hideLoading();
    return { success: false, error: 'Book is not available for borrowing' };
  }
  
  // Create borrow record
  const borrowRecord = {
    id: generateId(),
    userId: appState.currentUser.id,
    bookId: bookId,
    borrowDate: new Date().toISOString(),
    returnDate: null,
    status: 'BORROWED'
  };
  
  appState.borrowRecords.push(borrowRecord);
  
  // Update book availability
  book.availabilityStatus = false;
  book.updatedAt = new Date().toISOString();
  
  hideLoading();
  return { success: true };
}

async function returnBook(bookId) {
  showLoading();
  await simulateApiDelay();
  
  const borrowRecord = appState.borrowRecords.find(r => 
    r.bookId === bookId && 
    r.userId === appState.currentUser.id && 
    r.status === 'BORROWED'
  );
  
  if (!borrowRecord) {
    hideLoading();
    return { success: false, error: 'No active borrow record found' };
  }
  
  // Update borrow record
  borrowRecord.returnDate = new Date().toISOString();
  borrowRecord.status = 'RETURNED';
  
  // Update book availability
  const book = appState.books.find(b => b.id === bookId);
  book.availabilityStatus = true;
  book.updatedAt = new Date().toISOString();
  
  hideLoading();
  return { success: true };
}

async function addBook(bookData) {
  showLoading();
  await simulateApiDelay();
  
  const newBook = {
    id: generateId(),
    title: bookData.title,
    author: bookData.author,
    isbn: bookData.isbn,
    availabilityStatus: bookData.availabilityStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  appState.books.push(newBook);
  
  hideLoading();
  return { success: true, book: newBook };
}

async function updateBook(bookId, bookData) {
  showLoading();
  await simulateApiDelay();
  
  const book = appState.books.find(b => b.id === bookId);
  if (!book) {
    hideLoading();
    return { success: false, error: 'Book not found' };
  }
  
  book.title = bookData.title;
  book.author = bookData.author;
  book.isbn = bookData.isbn;
  book.availabilityStatus = bookData.availabilityStatus;
  book.updatedAt = new Date().toISOString();
  
  hideLoading();
  return { success: true, book };
}

async function deleteBook(bookId) {
  showLoading();
  await simulateApiDelay();
  
  const bookIndex = appState.books.findIndex(b => b.id === bookId);
  if (bookIndex === -1) {
    hideLoading();
    return { success: false, error: 'Book not found' };
  }
  
  // Remove book
  appState.books.splice(bookIndex, 1);
  
  // Remove related borrow records
  appState.borrowRecords = appState.borrowRecords.filter(r => r.bookId !== bookId);
  
  hideLoading();
  return { success: true };
}

// UI Functions
function showAuthPage() {
  document.getElementById('auth-page').classList.remove('hidden');
  document.getElementById('main-app').classList.add('hidden');
}

function showMainApp() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  
  // Update user name in header
  document.getElementById('user-name').textContent = appState.currentUser.username;
  
  // Show/hide admin elements
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    if (appState.currentUser.role === 'ADMIN') {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
  
  switchView('books');
}

function switchView(viewName) {
  appState.currentView = viewName;
  
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
  
  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  document.getElementById(`${viewName}-view`).classList.add('active');
  
  // Load view data
  switch(viewName) {
    case 'books':
      renderBooks();
      break;
    case 'dashboard':
      renderDashboard();
      break;
    case 'admin':
      renderAdmin();
      break;
  }
}

function renderBooks() {
  const booksGrid = document.getElementById('books-grid');
  const emptyState = document.getElementById('books-empty-state');
  const filteredBooks = getFilteredBooks();
  
  if (filteredBooks.length === 0) {
    booksGrid.style.display = 'none';
    emptyState.classList.remove('hidden');
    return;
  }
  
  booksGrid.style.display = 'grid';
  emptyState.classList.add('hidden');
  
  booksGrid.innerHTML = filteredBooks.map(book => {
    const isAvailable = book.availabilityStatus;
    const userHasBorrowed = appState.borrowRecords.some(r => 
      r.bookId === book.id && 
      r.userId === appState.currentUser.id && 
      r.status === 'BORROWED'
    );
    
    return `
      <div class="book-card" onclick="showBookDetails('${book.id}')" tabindex="0" onkeypress="handleBookCardKeyPress(event, '${book.id}')">
        <div class="book-cover">📖</div>
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">by ${book.author}</p>
        <p class="book-isbn">ISBN: ${book.isbn}</p>
        <div class="book-status">
          <span class="status-dot ${isAvailable ? 'status-dot--available' : 'status-dot--borrowed'}"></span>
          <span>${isAvailable ? 'Available' : 'Borrowed'}</span>
        </div>
      </div>
    `;
  }).join('');
}

function handleBookCardKeyPress(event, bookId) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showBookDetails(bookId);
  }
}

function renderDashboard() {
  const borrowedBooksList = document.getElementById('borrowed-books-list');
  const borrowedEmptyState = document.getElementById('borrowed-empty-state');
  const historyList = document.getElementById('borrow-history-list');
  const historyEmptyState = document.getElementById('history-empty-state');
  
  // Currently borrowed books
  const currentBorrows = appState.borrowRecords.filter(r => 
    r.userId === appState.currentUser.id && r.status === 'BORROWED'
  );
  
  if (currentBorrows.length === 0) {
    borrowedBooksList.style.display = 'none';
    borrowedEmptyState.classList.remove('hidden');
  } else {
    borrowedBooksList.style.display = 'block';
    borrowedEmptyState.classList.add('hidden');
    
    borrowedBooksList.innerHTML = currentBorrows.map(record => {
      const book = appState.books.find(b => b.id === record.bookId);
      return `
        <div class="book-item">
          <div class="book-info">
            <h4>${book.title}</h4>
            <p>Borrowed: ${formatDate(record.borrowDate)}</p>
          </div>
          <button class="btn btn--outline btn--sm" onclick="handleReturnBook('${book.id}')">Return</button>
        </div>
      `;
    }).join('');
  }
  
  // Borrowing history
  const history = appState.borrowRecords.filter(r => 
    r.userId === appState.currentUser.id && r.status === 'RETURNED'
  );
  
  if (history.length === 0) {
    historyList.style.display = 'none';
    historyEmptyState.classList.remove('hidden');
  } else {
    historyList.style.display = 'block';
    historyEmptyState.classList.add('hidden');
    
    historyList.innerHTML = history.map(record => {
      const book = appState.books.find(b => b.id === record.bookId);
      return `
        <div class="book-item">
          <div class="book-info">
            <h4>${book.title}</h4>
            <p>Borrowed: ${formatDate(record.borrowDate)} - Returned: ${formatDate(record.returnDate)}</p>
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderAdmin() {
  renderAdminStats();
  renderAdminBooks();
  renderAdminUsers();
}

function renderAdminStats() {
  const totalBooks = appState.books.length;
  const availableBooks = appState.books.filter(b => b.availabilityStatus).length;
  const borrowedBooks = appState.books.filter(b => !b.availabilityStatus).length;
  const totalUsers = appState.users.length;
  
  document.getElementById('total-books').textContent = totalBooks;
  document.getElementById('available-books').textContent = availableBooks;
  document.getElementById('borrowed-books-count').textContent = borrowedBooks;
  document.getElementById('total-users').textContent = totalUsers;
}

function renderAdminBooks() {
  const booksList = document.getElementById('admin-books-list');
  
  booksList.innerHTML = appState.books.map(book => `
    <div class="admin-book-item">
      <div class="admin-item-info">
        <h4>${book.title}</h4>
        <p>by ${book.author} • ISBN: ${book.isbn}</p>
        <p>Status: ${book.availabilityStatus ? 'Available' : 'Borrowed'}</p>
      </div>
      <div class="admin-item-actions">
        <button class="btn btn--outline btn--sm" onclick="editBook('${book.id}')">Edit</button>
        <button class="btn btn--outline btn--sm" onclick="confirmDeleteBook('${book.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderAdminUsers() {
  const usersList = document.getElementById('admin-users-list');
  
  usersList.innerHTML = appState.users.map(user => {
    const userBorrows = appState.borrowRecords.filter(r => r.userId === user.id && r.status === 'BORROWED').length;
    
    return `
      <div class="admin-user-item">
        <div class="admin-item-info">
          <h4>${user.username}</h4>
          <p>${user.email} • Role: ${user.role}</p>
          <p>Currently borrowed: ${userBorrows} books</p>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Functions
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

function hideAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.classList.add('hidden');
  });
}

function showBookDetails(bookId) {
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  const modal = document.getElementById('book-modal');
  
  document.getElementById('modal-book-title').textContent = book.title;
  document.getElementById('modal-book-author').textContent = book.author;
  document.getElementById('modal-book-isbn').textContent = book.isbn;
  
  const statusSpan = document.getElementById('modal-book-status');
  statusSpan.textContent = book.availabilityStatus ? 'Available' : 'Borrowed';
  statusSpan.className = book.availabilityStatus ? 'status status--success' : 'status status--error';
  
  const actionBtn = document.getElementById('modal-book-action');
  const userHasBorrowed = appState.borrowRecords.some(r => 
    r.bookId === book.id && 
    r.userId === appState.currentUser.id && 
    r.status === 'BORROWED'
  );
  
  if (userHasBorrowed) {
    actionBtn.textContent = 'Return';
    actionBtn.onclick = () => handleReturnBook(bookId);
    actionBtn.style.display = 'inline-flex';
  } else if (book.availabilityStatus) {
    actionBtn.textContent = 'Borrow';
    actionBtn.onclick = () => handleBorrowBook(bookId);
    actionBtn.style.display = 'inline-flex';
  } else {
    actionBtn.style.display = 'none';
  }
  
  showModal('book-modal');
}

function showConfirm(message, onConfirm) {
  document.getElementById('confirm-message').textContent = message;
  
  const confirmBtn = document.getElementById('confirm-ok');
  // Remove any existing event listeners
  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  
  newConfirmBtn.onclick = () => {
    onConfirm();
    hideModal('confirm-modal');
  };
  
  showModal('confirm-modal');
}

// Event Handlers
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Clear previous errors
  document.getElementById('login-email-error').textContent = '';
  document.getElementById('login-password-error').textContent = '';
  
  // Validation
  if (!validateEmail(email)) {
    document.getElementById('login-email-error').textContent = 'Please enter a valid email';
    return;
  }
  
  if (!validatePassword(password)) {
    document.getElementById('login-password-error').textContent = 'Password must be at least 6 characters';
    return;
  }
  
  const result = await login(email, password);
  
  if (result.success) {
    showToast('Login successful!', 'success');
    showMainApp();
  } else {
    showToast(result.error, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  
  // Clear previous errors
  document.getElementById('register-username-error').textContent = '';
  document.getElementById('register-email-error').textContent = '';
  document.getElementById('register-password-error').textContent = '';
  
  // Validation
  if (username.trim().length < 3) {
    document.getElementById('register-username-error').textContent = 'Username must be at least 3 characters';
    return;
  }
  
  if (!validateEmail(email)) {
    document.getElementById('register-email-error').textContent = 'Please enter a valid email';
    return;
  }
  
  if (!validatePassword(password)) {
    document.getElementById('register-password-error').textContent = 'Password must be at least 6 characters';
    return;
  }
  
  const result = await register({ username, email, password, role });
  
  if (result.success) {
    showToast('Registration successful!', 'success');
    showMainApp();
  } else {
    showToast(result.error, 'error');
  }
}

async function handleBorrowBook(bookId) {
  const result = await borrowBook(bookId);
  
  if (result.success) {
    showToast('Book borrowed successfully!', 'success');
    hideModal('book-modal');
    renderBooks();
    renderDashboard();
    if (appState.currentView === 'admin') {
      renderAdmin();
    }
  } else {
    showToast(result.error, 'error');
  }
}

async function handleReturnBook(bookId) {
  const result = await returnBook(bookId);
  
  if (result.success) {
    showToast('Book returned successfully!', 'success');
    hideModal('book-modal');
    renderBooks();
    renderDashboard();
    if (appState.currentView === 'admin') {
      renderAdmin();
    }
  } else {
    showToast(result.error, 'error');
  }
}

function editBook(bookId) {
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  document.getElementById('book-form-title').textContent = 'Edit Book';
  document.getElementById('book-title-input').value = book.title;
  document.getElementById('book-author-input').value = book.author;
  document.getElementById('book-isbn-input').value = book.isbn;
  document.getElementById('book-availability-input').value = book.availabilityStatus.toString();
  
  const form = document.getElementById('book-form');
  // Remove existing submit handler
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  newForm.onsubmit = (e) => handleBookForm(e, bookId);
  
  showModal('book-form-modal');
}

function addNewBook() {
  document.getElementById('book-form-title').textContent = 'Add New Book';
  const form = document.getElementById('book-form');
  form.reset();
  
  // Remove existing submit handler
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  newForm.onsubmit = (e) => handleBookForm(e);
  
  showModal('book-form-modal');
}

async function handleBookForm(event, bookId = null) {
  event.preventDefault();
  
  const bookData = {
    title: document.getElementById('book-title-input').value,
    author: document.getElementById('book-author-input').value,
    isbn: document.getElementById('book-isbn-input').value,
    availabilityStatus: document.getElementById('book-availability-input').value === 'true'
  };
  
  let result;
  if (bookId) {
    result = await updateBook(bookId, bookData);
  } else {
    result = await addBook(bookData);
  }
  
  if (result.success) {
    showToast(bookId ? 'Book updated successfully!' : 'Book added successfully!', 'success');
    hideModal('book-form-modal');
    renderBooks();
    renderAdmin();
  } else {
    showToast(result.error, 'error');
  }
}

function confirmDeleteBook(bookId) {
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;
  
  showConfirm(
    `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
    () => handleDeleteBook(bookId)
  );
}

async function handleDeleteBook(bookId) {
  const result = await deleteBook(bookId);
  
  if (result.success) {
    showToast('Book deleted successfully!', 'success');
    renderBooks();
    renderAdmin();
  } else {
    showToast(result.error, 'error');
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  // Ensure all modals are hidden on page load
  hideAllModals();
  
  // Auth form switching
  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  });
  
  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });
  
  // Form submissions
  document.getElementById('login-form-element').addEventListener('submit', handleLogin);
  document.getElementById('register-form-element').addEventListener('submit', handleRegister);
  
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });
  
  // User menu
  document.querySelector('.user-menu-btn').addEventListener('click', () => {
    document.querySelector('.user-menu-dropdown').classList.toggle('hidden');
  });
  
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Search and filters
  document.getElementById('search-input').addEventListener('input', (e) => {
    appState.filters.search = e.target.value;
    renderBooks();
  });
  
  document.getElementById('availability-filter').addEventListener('change', (e) => {
    appState.filters.availability = e.target.value;
    renderBooks();
  });
  
  document.getElementById('clear-filters').addEventListener('click', () => {
    appState.filters = { search: '', availability: '' };
    document.getElementById('search-input').value = '';
    document.getElementById('availability-filter').value = '';
    renderBooks();
  });
  
  // Admin tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
  });
  
  // Add book button
  document.getElementById('add-book-btn').addEventListener('click', addNewBook);
  
  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Modal backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Confirm modal buttons
  document.getElementById('confirm-cancel').addEventListener('click', () => {
    hideModal('confirm-modal');
  });
  
  // Close user menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      document.querySelector('.user-menu-dropdown').classList.add('hidden');
    }
  });
  
  // ESC key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideAllModals();
    }
  });
  
  // Initialize with auth page
  showAuthPage();
});
# 🛠️ E-Commerce Backend API

This is the backend for the **Admin Dashboard** of an e-commerce site. It handles product data, banner uploads, and order saving. Built using **Node.js**, **Express**, and **Multer** for file uploads.

---

## 🔧 Tech Stack

- **Node.js** – runtime environment
- **Express.js** – backend framework
- **Multer** – file/image upload middleware
- **CORS** – for cross-origin requests
- **File System (fs)** – to delete or manage files
- **JSON storage** or **Database (optional)** – to persist product/order data

---

## 🚀 Features

- 🧾 **Product API**
  - Add new products with multiple images
  - Support for color-specific image groups
  - Editable product data: name, description, stock, price, etc.

- 🖼️ **Banner API**
  - Upload up to 5 banners
  - Delete and fetch banners dynamically

- 📦 **Order API**
  - Save and retrieve order data
  - Includes customer info and product summary

- 📤 **Image Upload**
  - Uses `Multer` for handling uploads
  - Stores images in `/public/uploads/`

---

## 📂 Folder Structure


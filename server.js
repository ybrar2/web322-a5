/*********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Yashleen Brar     Student ID: 140682238    Date: 2025-03-22
*
*  Published URL: (add your Vercel/VPS/Render/Glitch link here when deployed)
*
********************************************************************************/

const express = require('express');
const app = express();
const path = require('path');
const dataService = require('./modules/data-service');

const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (optional)
// app.use(express.static('public'));

// ======================
// Routes
// ======================

// Home redirect
app.get('/', (req, res) => {
  res.redirect('/addSite');
});

// GET: Add Site Form
app.get('/addSite', (req, res) => {
  dataService.getAllProvincesAndTerritories()
    .then(data => {
      res.render('addSite', { provincesAndTerritories: data });
    })
    .catch(err => {
      res.render('500', { message: `Error: ${err}` });
    });
});

// POST: Add Site
app.post('/addSite', (req, res) => {
  dataService.addSite(req.body)
    .then(() => res.redirect('/sites'))
    .catch(err => res.render('500', { message: `Error: ${err}` }));
});

// GET: All Sites List
app.get('/sites', (req, res) => {
  dataService.getAllSites()
    .then(data => {
      res.render('sites', { sites: data });
    })
    .catch(err => {
      res.render('500', { message: `Error: ${err}` });
    });
});

// GET: Edit Site Form
app.get('/editSite/:id', (req, res) => {
  Promise.all([
    dataService.getSiteById(req.params.id),
    dataService.getAllProvincesAndTerritories()
  ])
    .then(([site, provincesAndTerritories]) => {
      res.render('editSite', { site, provincesAndTerritories });
    })
    .catch(err => {
      res.render('500', { message: `Error: ${err}` });
    });
});

// POST: Edit Site
app.post('/editSite', (req, res) => {
  dataService.editSite(req.body.siteId, req.body)
    .then(() => res.redirect('/sites'))
    .catch(err => res.render('500', { message: `Error: ${err}` }));
});

// ✅ NEW: GET /deleteSite/:id - Delete a site
app.get('/deleteSite/:id', (req, res) => {
  dataService.deleteSite(req.params.id)
    .then(() => res.redirect('/sites'))
    .catch(err => {
      res.render('500', { message: `Error deleting site: ${err}` });
    });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).render('404', { message: "Page Not Found" });
});

// ======================
// Start Server
// ======================
dataService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`🚀 Express HTTP server listening on: http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize data service:", err);
  });

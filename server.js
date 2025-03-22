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
*  Published URL: https://web322-a5-rusk.onrender.com
*
********************************************************************************/

const express = require('express');
const app = express();
const path = require('path');
const dataService = require('./modules/data-service');

const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse form data from POST requests
app.use(express.urlencoded({ extended: true }));

// Optional: serve static assets if needed
// app.use(express.static('public'));

// ======================
// ROUTES
// ======================

// Home Page (can customize this to render a home.ejs if desired)
app.get('/', (req, res) => {
  res.redirect('/addSite'); // Or render('home') if you have a homepage
});

// GET: Add Site Form
app.get('/addSite', (req, res) => {
  dataService.getAllProvincesAndTerritories()
    .then(data => {
      res.render('addSite', { provincesAndTerritories: data });
    })
    .catch(err => {
      res.status(500).render('500', { message: `Error loading form: ${err}` });
    });
});

// POST: Submit New Site
app.post('/addSite', (req, res) => {
  dataService.addSite(req.body)
    .then(() => res.redirect('/sites'))
    .catch(err => res.status(500).render('500', { message: `Error adding site: ${err}` }));
});

// GET: View All Sites
app.get('/sites', (req, res) => {
  dataService.getAllSites()
    .then(data => {
      res.render('sites', { sites: data });
    })
    .catch(err => res.status(500).render('500', { message: `Error fetching sites: ${err}` }));
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
    .catch(err => res.status(500).render('500', { message: `Error loading edit form: ${err}` }));
});

// POST: Submit Site Edit
app.post('/editSite', (req, res) => {
  dataService.editSite(req.body.siteId, req.body)
    .then(() => res.redirect('/sites'))
    .catch(err => res.status(500).render('500', { message: `Error editing site: ${err}` }));
});

// GET: Delete a Site
app.get('/deleteSite/:id', (req, res) => {
  dataService.deleteSite(req.params.id)
    .then(() => res.redirect('/sites'))
    .catch(err => res.status(500).render('500', { message: `Error deleting site: ${err}` }));
});

// 404 Page (for undefined routes)
app.use((req, res) => {
  res.status(404).render('404', { message: "Page Not Found" });
});

// ======================
// START SERVER
// ======================
dataService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`🚀 Server running at http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize data service:", err);
  });

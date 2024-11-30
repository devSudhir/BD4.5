const express = require('express');
const { resolve } = require('path');

const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());
const port = 3010;

let db;
(async () => {
  db = await open({
    filename: './BD4.5/database.sqlite',
    driver: sqlite3.Database,
  });
})();

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

async function filterMoviesByYearAndActor(year, actor) {
  const query = 'Select * from movies where release_year = ? and actor = ?';
  const response = await db.all(query, [year, actor]);
  return response;
}
app.get('/movies/year-actor', async (req, res) => {
  const { year, actor } = req.query;
  try {
    const result = await filterMoviesByYearAndActor(year, actor);
    if (result.length === 0) {
      res
        .status(404)
        .json({ error: 'Movies related to year and actor not found!' });
    } else {
      res.status(200).json({ movies: result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function filterMoviesByRatingAndSortIt() {
  const query = 'select * from movies where rating >= 4.5 order by rating';
  const response = await db.all(query, []);
  return response;
}

app.get('/movies/award-winning', async (req, res) => {
  try {
    const result = await filterMoviesByRatingAndSortIt();
    if (result.length === 0) {
      res.status(404).json({ error: 'No award winning movie found' });
    } else {
      res.status(200).json({ movies: result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function filterMoviesBoxOfficeCollectionAndSortItDesc() {
  const query =
    'select * from movies where box_office_collection >= 100 order by box_office_collection desc';
  const response = await db.all(query, []);
  return response;
}

app.get('/movies/blockbuser', async (req, res) => {
  try {
    const result = await filterMoviesBoxOfficeCollectionAndSortItDesc();
    if (result.length === 0) {
      res.status(404).json({ error: 'Blckbuster movie found' });
    } else {
      res.status(200).json({ movies: result });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

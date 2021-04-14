"use strict";

const express = require("express");
const router = express.Router();
const utils = require("../config/utilities");
const Artist = require("./schema/Artist");
const Track = require("./schema/Track");
const { deleteArtists, deleteTracks, insertArtists, insertTracks } = utils;

router.route("/").get((_req, res) => {
  console.log("GET /");
  res.status(200).send({
    data: "App is running.",
  });
});

///////////////////////////////
// Your code below this line //
///////////////////////////////

router
  .route("/artists")
  .get((_req, res) => {
    // implemented for you:
    console.log("GET /artists");
    Artist.find({}).then((artists) => {
      res.status(200).send(artists);
    });
  })
  .post((req, res) => {
    console.log("POST /artists");
    const { name, genres, spotify_id, image_url } = req.body;
    if (!name || !genres) res.sendStatus(400);
    else {
      const artist = new Artist({ name, genres, spotify_id, image_url });
      artist.save((err) => {
        if (err) {
          res.sendStatus(400);
        } else {
          res.sendStatus(201);
        }
      });
    }
  });

router
  .route("/artists/:id")
  .get((req, res) => {
    console.log(`GET /artists/${req.params.id}`);
    const { id } = req.params;
    Artist.findById(id)
      .then((data) => {
        if (!data) res.status(404).send(`artist with id ${id} not found`);
        else {
          res.status(200).send(data);
        }
      })
      .catch(() => {
        res.status(404).send(`artist with id ${id} not found`);
      });
  })
  .patch((req, res) => {
    console.log(`PATCH /artists/${req.params.id}`);
    const { id } = req.params;
    const { name, genres, spotify_id, image_url } = req.body;
    const artist = {};
    if (name) artist.name = name;
    if (genres) artist.genres = genres;
    if (spotify_id) artist.spotify_id = spotify_id;
    if (image_url) artist.image_url = image_url;
    Artist.findOneAndUpdate({ _id: id }, artist, { new: true })
      .then((data) => {
        if (!data) res.status(404).send(`artist with id ${id} not found`);
        else {
          res.status(200).send(data);
        }
      })
      .catch(() => {
        console.log("error");
        res.status(404).send(`artist with id ${id} not found`);
      });
  })
  .delete((req, res) => {
    console.log(`DELETE /artists/${req.params.id}`);
    const { id } = req.params;
    Artist.findOneAndDelete({ _id: id })
      .then((data) => {
        if (!data) res.status(404).send(`artist with id ${id} not found`);
        else {
          res.sendStatus(200);
        }
      })
      .catch(() => {
        res.status(404).send(`artist with id ${id} not found`);
      });
  });

router.route("/artists/:id/tracks").get((req, res) => {
  console.log(`GET /artists/${req.params.id}/tracks`);
  res.status(501).send();
});

router
  .route("/tracks")
  .get((_req, res) => {
    console.log("GET /tracks");
    // implemented for you:
    Track.find({}).then((tracks) => {
      res.status(200).send(tracks);
    });
  })
  .post((req, res) => {
    console.log("POST /doctors");
    res.status(501).send();
  });

router
  .route("/tracks/:id")
  .get((req, res) => {
    console.log(`GET /tracks/${req.params.id}`);
    res.status(501).send();
  })
  .patch((req, res) => {
    console.log(`PATCH /tracks/${req.params.id}`);
    res.status(501).send();
  })
  .delete((req, res) => {
    console.log(`DELETE /tracks/${req.params.id}`);
    res.status(501).send();
  });

router.route("/search").get((req, res) => {
  console.log(`GET /search`);
  console.log(req.query);

  // validation code:
  if (!req.query.term) {
    res.status(400).send({
      message: `"term" query parameter is required. Valid search string: /search?term=beyonce&type=track`,
    });
    return; // don't forget the return to exit early!
  }
  if (!req.query.type || !["artist", "track"].includes(req.query.type)) {
    res.status(400).send({
      message: `"type" query parameter is required and must either be "artist" or "track". Valid search string: /search?term=beyonce&type=track`,
    });
    return; // don't forget the return to exit early!
  }

  /**
   * your code below this comment:
   * if req.query.type === 'artist', query the Artist collection
   * for any artist that matches the search term
   *
   * if req.query.type === 'track', query the Track collection
   * for any artist that matches the search term
   *
   * Use regular expressions (see Lecture 5 for details)
   */

  const { type, term, sort, limit } = req.query;

  const doSortLimit = (query) => {
    if (sort === "asc" || sort === "desc") {
      query = query.sort({ name: sort });
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    return query;
  };

  if (type === "artist") {
    doSortLimit(Artist.find({ name: { $regex: term, $options: "i" } })).then(
      (data) => {
        res.status(200).send(data);
      }
    );
  } else if (type === "track") {
    doSortLimit(Track.find({ name: { $regex: term, $options: "i" } })).then(
      (data) => {
        res.status(200).send(data);
      }
    );
  } else {
    res
      .status(400)
      .send(`type must be either 'artist' or 'track', not ${type}`);
  }
});

///////////////////////////////
// Your code above this line //
///////////////////////////////
router.route("/reset").get((_req, res) => {
  deleteArtists()
    .then((results) => {
      console.log("All artists have been deleted from the database.");
    })
    .then(deleteTracks)
    .then((results) => {
      console.log("All tracks have been deleted from the database.");
    })
    .then(insertArtists)
    .then((results) => {
      console.log(
        results.length + " artists have been inserted into the database."
      );
    })
    .then(insertTracks)
    .then((results) => {
      console.log(
        results.length + " tracks have been inserted into the database."
      );
      res.status(200).send({
        message: "Data has been reset.",
      });
    });
});
module.exports = router;

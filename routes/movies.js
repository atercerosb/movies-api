const express = require('express')
const MoviesService = require('../services/movies')
const { movieIdSchema, createMovieSchema, updateMovieSchema } = require('../utils/schemas/movies')
const validationHandler = require('../utils/middleware/validationHandler')

const cacheResponse = require('../utils/cacheResponse')
const { FIVE_MINUTES_IN_SECONDS, SIXTY_MINUTES_IN_SECONDS } = require('../utils/time')

function moviesApi(app) {
    const router = express.Router()
    app.use("/api/movies", router)

    const moviesService = new MoviesService()

    router.get('/', async function(req, res, next) {
        cacheResponse(res, FIVE_MINUTES_IN_SECONDS)

        const { tags } = req.query
        try {
            const movies = await moviesService.getMovies({ tags })
                //throw new Error('Error getting movies') //manejo de errores

            res.status(200).json({
                data: movies,
                message: 'movies listed'
            })
        } catch (err) {
            next(err)
        }
    })
    router.get('/:movieId', validationHandler({ movieId: movieIdSchema }, 'params'), async function(req, res, next) {
        cacheResponse(res, SIXTY_MINUTES_IN_SECONDS)
        const { movieId } = req.params
        try {
            const movies = await moviesService.getMovie({ movieId })

            res.status(200).json({
                data: movies,
                message: 'movies retrieved'
            })
        } catch (err) {
            next(err)
        }
    })
    router.post('/', validationHandler(createMovieSchema), async function(req, res, next) {
        const { body: movie } = req
        try {
            const createdMovieId = await moviesService.createMovie({ movie })

            res.status(201).json({
                data: createdMovieId,
                message: 'movie created'
            })
        } catch (err) {
            next(err)
        }
    })
    router.put('/:movieId', validationHandler({ movieId: movieIdSchema }, 'params'), validationHandler(updateMovieSchema), async function(req, res, next) {
        const { body: movie } = req
        const { movieId } = req.params
        try {
            const updateMovieId = await moviesService.updatedMovie({ movieId, movie })

            res.status(200).json({
                data: updateMovieId,
                message: 'movie updated'
            })
        } catch (err) {
            next(err)
        }
    })
    router.delete('/:movieId', validationHandler({ movieId: movieIdSchema }, 'params'), async function(req, res, next) {
        const { movieId } = req.params
        try {
            const deletedMovieId = await moviesService.deletedMovie({ movieId })

            res.status(200).json({
                data: deletedMovieId,
                message: 'movie deleted'
            })
        } catch (err) {
            next(err)
        }
    })
}

module.exports = moviesApi
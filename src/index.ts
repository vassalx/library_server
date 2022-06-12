import express from 'express'
import cors from 'cors'
import routes from './routes'
import cookieSession from 'cookie-session'

const app = express()

const corsOptions = {
  origin: 'http://localhost:8081',
  credentials: true,
}

app.use(cors(corsOptions))
// parse requests of content-type - application/json
app.use(express.json())
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
// use cookie in session
app.use(
  cookieSession({
    name: 'library-session',
    secret: process.env.COOKIE_SESSION || 'secret', // should use as secret environment variable
    httpOnly: true,
  }),
)
// simple route
app.use('/', routes)

// set port, listen for requests
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})

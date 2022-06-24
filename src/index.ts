import cookieSession from 'cookie-session'
import cors from 'cors'
import express from 'express'

import routes from './routes'

const app = express()

const corsOptions = {
  origin: ['https://library2022.ew.r.appspot.com', 'http://localhost:8081'],
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
    sameSite: 'none',
  }),
)
// simple route
app.use('/api', routes)

// set port, listen for requests
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`)
})

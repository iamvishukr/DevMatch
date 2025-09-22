# DevMatch APIs

## Status : Interested, Ignored, Accepted, Rejected

## authRouter
/POST /signup
/POST /login
/POST /logout

## profileRouter
-GET /profile/view
-PATCH /profile/edit
-PATCH /profile/password_reset

## connectionRouter
/POST /request/send/:status/:user_id                 --> :status :: interested || ignored
/POST /request/review/:status/:request_id            --> :status :: accepted || rejected

## userRouter
/GET /user/request/received
/GET /user/connections
/GET /user/feed
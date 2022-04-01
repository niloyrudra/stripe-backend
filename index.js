require( "dotenv" ).config();
const express = require( "express" );
const bodyParse = require( "body-parser" );
const cors = require( "cors" );
const Stripe = require( "stripe" );

// Defining App Instance
const app = express();
// Stripe Instance
const stripe = Stripe( process.env.STRIPE_SECRETE_KEY );
// PORT
const PORT = process.env.PORT || 5000;

// MiddleWares
app.use( express.json() );
app.use( cors() );

// Declaring Server
app.listen( PORT, () => console.log( `Server running on port ${PORT}` ) );

// GET Request
app.get( "/", async ( req, res ) => {
    try {
        console.log( "Congratulations!" );
        res.status(200).json( { message: `Congratulation!` } );
    }
    catch( err ) {
        console.log( "Something wet wrong!", err );
        res.status(500).json( { message: `Error happened - ${err.message}` } );
    }
} );

// POST Request
app.post( "/create-payment-intent", async ( req, res ) => {
    try {
      // Getting data from client
      let { amount, name, email } = req.query; // req.body;

      // Simple validation
      if (!amount && !name)
        return res.status(400).json({ message: "All fields are required" });
      
      amount = parseInt(amount);
      // Initiate payment
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "gbp",
        payment_method_types: ["card"],
        metadata: { name, email },
      });
      // Extracting the client secret 
      const clientSecret = paymentIntent.client_secret;
      // Sending the client secret as response
      res.json({ message: "Payment initiated", clientSecret });
    } catch (err) {
      // Catch any error and send error 500 to client
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
});
import express from 'express'


const app = express()


const PORT = process.env.PORT || 3000; 

app.get('/sisya', (req, res) => {
  res.json({
    text: 'pipisya',
  }); 
})

app.get('/products', (req, res) => {
    // i need connection to databasse
    // i query database to get all product
    // i need to convert query response into format usable by client(json)
    // i need to send json back to clien.
    // i can do it by calling res.send();
})

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
})
//
// {
// products: [{id: 1, name: "Krem"}, {id: 2, name: "Hitler"}]
// }
// utils/apiFeatures.js
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  
  filter() { /*...*/ }
  sort() { /*...*/ }
  limitFields() { /*...*/ }
  paginate() { /*...*/ }
}
module.exports = APIFeatures;
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  static buildFilter(queryString = {}) {
    const filter = {};
    const q = queryString;

    if (q.keyword) {
      const term = String(q.keyword).trim();
      if (term) {
        filter.$or = [
          { name: { $regex: term, $options: 'i' } },
          { brand: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
        ];
      }
    }

    if (q.category) filter.category = q.category;
    if (q.brand) filter.brand = q.brand;

    if (q.minPrice || q.maxPrice) {
      filter.price = {};
      if (q.minPrice) filter.price.$gte = Number(q.minPrice);
      if (q.maxPrice) filter.price.$lte = Number(q.maxPrice);
    }

    if (q.rating) {
      filter.ratings = { $gte: Number(q.rating) };
    }

    const excluded = [
      'page',
      'sort',
      'limit',
      'fields',
      'keyword',
      'category',
      'brand',
      'minPrice',
      'maxPrice',
      'rating',
    ];
    const queryObj = { ...q };
    excluded.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    let extra = {};
    try {
      extra = JSON.parse(queryStr || '{}');
    } catch {
      extra = {};
    }

    if (Object.keys(extra).length === 0) return filter;

    return { ...filter, ...extra };
  }

  filter() {
    const built = APIFeatures.buildFilter(this.queryString);
    this.query = this.query.find(built);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(this.queryString.limit, 10) || 12));
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

async function countFilteredTotal(Model, queryString) {
  const filter = APIFeatures.buildFilter(queryString);
  return Model.countDocuments(filter);
}

module.exports = APIFeatures;
module.exports.countFilteredTotal = countFilteredTotal;

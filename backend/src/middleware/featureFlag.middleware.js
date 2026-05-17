
const featureGPS = (req, res, next) => {
  if (!req.user || req.user.seeUpdates !== 1) {
    return res.status(403).json({
      message: 'Această funcție nu este disponibilă momentan.'
    });
  }
  next();
};

module.exports = { featureGPS };
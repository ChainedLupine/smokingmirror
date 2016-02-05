
module.exports = {

  DTR: 0.0174533,
  RTD: 57.2958,

  degToRad: function (deg) {
    return deg * 0.0174533 ;
  },

  clamp: function ( value, min, max ) {

		return Math.max( min, Math.min( max, value ) );

	},
  clamp01: function ( value ) {

		return Math.max( 0, Math.min( 1, value ) );

	},
};

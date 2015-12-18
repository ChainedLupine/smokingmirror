
  GlowFilter = function() {
      var uniforms = {
        sumBias: {
          type: 'f',
          value: 0.03
        },
        factorMax: {
          type: 'f',
          value: 1.8
        },
      };

      var fragmentSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        'uniform sampler2D uSampler;',
        'uniform float factorMax;',
        'uniform float sumBias;',

        'void main() {',
          'vec4 sum = vec4(0);',
          'vec2 texcoord = vTextureCoord;',
          'for(int xx = -4; xx <= 4; xx++) {',
            'for(int yy = -4; yy <= 4; yy++) {',
              'float dist = sqrt(float(xx*xx) + float(yy*yy));',
              'float factor = 0.0;',
              'if (dist == 0.0) {',
                'factor = factorMax;',
              '} else {',
                'factor = factorMax/abs(float(dist));',
              '}',
              'sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;',
            '}',
          '}',
          'gl_FragColor = sum * /*0.025*/ sumBias + texture2D(uSampler, texcoord);',
        '}'
      ].join('\n') ;

    var vertexSrc = null ;


    PIXI.AbstractFilter.call(this,
                             vertexSrc,
                             fragmentSrc,
                             uniforms
                             );
  };

  GlowFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
  GlowFilter.prototype.constructor = GlowFilter;

  Object.defineProperties(GlowFilter.prototype, {
    sumBias: {
      get: function() {
        return this.uniforms.sumBias.value;
      },
      set: function(value) {
        this.uniforms.sumBias.value = value;
      }
    },
    factorMax: {
      get: function() {
        return this.uniforms.factorMax.value;
      },
      set: function(value) {
        this.uniforms.factorMax.value = value;
      }
    }
  });


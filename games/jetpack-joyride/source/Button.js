var a0_0x678433 = a0_0x156c;
function a0_0x156c(_0x171130, _0x2f252f) {
    var _0x13762d = a0_0x1376();
    return a0_0x156c = function(_0x156c45, _0x523761) {
        _0x156c45 = _0x156c45 - 0x1ad;
        var _0x1954ef = _0x13762d[_0x156c45];
        return _0x1954ef;
    }
    ,
    a0_0x156c(_0x171130, _0x2f252f);
}
function a0_0x1376() {
    var _0x5889f5 = ['tweens', 'key', 'substring', '_sel', '2047367gaaExD', 'setTexture', 'animateRelease', 'name', 'ui_select', 'pointerdown', 'length', 'add', 'scaleY', '8SQzhXn', 'pointerover', 'game_assets', '1121072fGJijr', 'sfx', 'child', '1501638KcyqVo', 'defaultScaleX', 'clicked', 'pointerout', 'focus', '3595617aWBdSk', '1305135pyCoqZ', 'Image', '165795yMhKGJ', '1658GFAMtO', '71hWdDMq', 'animateClick', 'play', 'texture', 'setInteractive', 'defaultScaleY', 'scene'];
    a0_0x1376 = function() {
        return _0x5889f5;
    }
    ;
    return a0_0x1376();
}
(function(_0x482593, _0x516c3b) {
    var _0xd88b15 = a0_0x156c
      , _0x4c61b1 = _0x482593();
    while (!![]) {
        try {
            var _0x4409ce = parseInt(_0xd88b15(0x1ba)) / 0x1 * (-parseInt(_0xd88b15(0x1b9)) / 0x2) + -parseInt(_0xd88b15(0x1b8)) / 0x3 * (parseInt(_0xd88b15(0x1ce)) / 0x4) + -parseInt(_0xd88b15(0x1b6)) / 0x5 + -parseInt(_0xd88b15(0x1b0)) / 0x6 + parseInt(_0xd88b15(0x1c5)) / 0x7 + parseInt(_0xd88b15(0x1ad)) / 0x8 + parseInt(_0xd88b15(0x1b5)) / 0x9;
            if (_0x4409ce === _0x516c3b)
                break;
            else
                _0x4c61b1['push'](_0x4c61b1['shift']());
        } catch (_0x230cdf) {
            _0x4c61b1['push'](_0x4c61b1['shift']());
        }
    }
}(a0_0x1376, 0x24f8f));
class Button extends Phaser['GameObjects'][a0_0x678433(0x1b7)] {
    constructor(_0x528523, _0x1bb2e4, _0x39cc23, _0x27b1e0, _0x372743) {
        var _0x56cf4f = a0_0x678433;
        super(_0x528523, _0x1bb2e4, _0x39cc23, _0x27b1e0, _0x372743),
        this[_0x56cf4f(0x1be)](),
        this[_0x56cf4f(0x1b2)] = ![],
        this['focus'] = ![],
        this['scene'] = _0x528523,
        _0x528523[_0x56cf4f(0x1cc)]['existing'](this),
        this[_0x56cf4f(0x1c8)] = _0x372743,
        this['on']('pointerout', this[_0x56cf4f(0x1c7)], this),
        this['on'](_0x56cf4f(0x1ca), this[_0x56cf4f(0x1bb)], this);
    }
    ['animateClick']() {
        var _0x5c9c5e = a0_0x678433;
        this[_0x5c9c5e(0x1b1)] == undefined && (this['defaultScaleX'] = this['scaleX'],
        this[_0x5c9c5e(0x1bf)] = this[_0x5c9c5e(0x1cd)]);
        if (this['clicked'])
            return;
        this[_0x5c9c5e(0x1b2)] = !![],
        this[_0x5c9c5e(0x1c0)]['sound'][_0x5c9c5e(0x1bc)](_0x5c9c5e(0x1c9), {
            'mute': !config['audio'][_0x5c9c5e(0x1ae)]
        }),
        this['scene'][_0x5c9c5e(0x1c1)][_0x5c9c5e(0x1cc)]({
            'targets': [this, this['child']],
            'scaleX': this[_0x5c9c5e(0x1b1)] - 0.1,
            'scaleY': this[_0x5c9c5e(0x1bf)] - 0.1,
            'duration': 0x19
        });
    }
    [a0_0x678433(0x1c7)]() {
        var _0x15264c = a0_0x678433;
        if (!this['clicked'])
            return;
        this[_0x15264c(0x1b2)] = ![],
        this[_0x15264c(0x1c0)][_0x15264c(0x1c1)][_0x15264c(0x1cc)]({
            'targets': [this, this[_0x15264c(0x1af)]],
            'scaleX': this['defaultScaleX'],
            'scaleY': this[_0x15264c(0x1bf)],
            'duration': 0x19
        });
    }
    ['setChild'](_0x1303ca) {
        var _0x496705 = a0_0x678433;
        this[_0x496705(0x1af)] = _0x1303ca;
    }
    ['setFocus'](_0x19ef02) {
        var _0x88c0c5 = a0_0x678433;
        this[_0x88c0c5(0x1b4)] = _0x19ef02;
        var _0x5abcf5 = this[_0x88c0c5(0x1c8)];
        if (_0x19ef02)
            _0x5abcf5 = this[_0x88c0c5(0x1c8)] + _0x88c0c5(0x1c4);
        this[_0x88c0c5(0x1c6)](_0x88c0c5(0x1d0), _0x5abcf5);
    }
    [a0_0x678433(0x1b3)]() {
        var _0x2cd77a = a0_0x678433
          , _0x16b089 = this[_0x2cd77a(0x1bd)][_0x2cd77a(0x1c2)]
          , _0x8449e7 = _0x16b089[_0x2cd77a(0x1c3)](_0x16b089[_0x2cd77a(0x1cb)] - 0x4, _0x16b089[_0x2cd77a(0x1cb)]);
        _0x8449e7 == _0x2cd77a(0x1c4) && (_0x16b089 = this['texture']['key'],
        _0x16b089 = _0x16b089[_0x2cd77a(0x1c3)](0x0, _0x16b089[_0x2cd77a(0x1cb)] - 0x4),
        this[_0x2cd77a(0x1c6)]('game_assets', _0x16b089),
        this[_0x2cd77a(0x1c7)]());
    }
    [a0_0x678433(0x1cf)]() {
        var _0x3fae7c = a0_0x678433
          , _0x5e440a = this[_0x3fae7c(0x1bd)]['key']
          , _0x211ea5 = _0x5e440a[_0x3fae7c(0x1c3)](_0x5e440a[_0x3fae7c(0x1cb)] - 0x4, _0x5e440a[_0x3fae7c(0x1cb)]);
        _0x211ea5 != _0x3fae7c(0x1c4) && this[_0x3fae7c(0x1c6)](_0x3fae7c(0x1d0), this['texture']['key'] + _0x3fae7c(0x1c4));
    }
}

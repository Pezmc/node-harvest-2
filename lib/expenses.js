var Expenses, _isUndefined = require('../mixin'), fs = require('fs'), request = require('request');

/*
debug = require('request-debug')(request, function(type, data, r) {
    console.warn(type, data, r);
});
*/

module.exports = Expenses = function (api) {
    this.api = api;
    this.client = api.client;
};

Expenses.prototype.list = function (options, cb) {
    var url = '/expenses';
    this.client.get(url, {}, cb);
};

Expenses.prototype.get = function (options, cb) {
    if (_isUndefined(options, 'id')) {
        return cb(new Error('retrieving a single expense requires an id'));
    }

    var url = '/expenses/' + options.id;
    this.client.get(url, {}, cb);
};

Expenses.prototype.create = function (options, cb) {
    var url = '/expenses';
    delete options.id;
    this.client.post(url, options, cb);
};

Expenses.prototype.update = function (options, cb) {
    if (_isUndefined(option, 'id')) {
        return cb(new Error('updating a single expense requires an id'));
    }

    var url = '/expenses/' + options.id;
    delete options.id;
    this.client.put(url, options, cb);
};

Expenses.prototype.delete = function (options, cb) {
    if (_isUndefined(option, 'id')) {
        return cb(new Error('deleting a single expense requires an id'));
    }

    var url = '/expenses/' + options.id;
    this.client.delete(url, {}, cb);
};

Expenses.prototype.attachReceipt = function (options, cb) {
    if (_isUndefined(options, 'id')) {
        return cb(new Error('attaching a receipt requires an id'));
    }

    if (_isUndefined(options, 'filepath')) {
        return cb(new Error('attaching a receipt requires an id'));
    }

    var formData = {
      'expense[receipt]': {
        value:  fs.createReadStream(options.filepath),
        options: {
          filename: 'topsecret.png'
        }
      }
    };

    var options = {
      url: this.api.host + '/expenses/' + options.id + "/receipt?access_token=" + this.api.access_token,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Expenses'
      },
      formData: formData
    };

    console.log(options);
    request.post(options, function callback(err, httpResponse, body) {
      if (err) {
        console.error('upload failed:', err);
        return cb(err, {});
      }
      console.log('Upload successful!  Server responded with:', body);
      return cb(null, body);
    });
};

Expenses.prototype.getReceipt = function (options, cb) {
    if (_isUndefined(option, 'id')) {
        return cb(new Error('getting a receipt requires an id'));
    }

    var url = '/expenses/' + options.id + '/receipt';
    this.client.get(url, {}, cb);
};

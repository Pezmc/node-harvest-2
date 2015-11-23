var restler = require('restler'),
    querystring = require('querystring'),
    util = require('util'),
    _isUndefined = require('./mixin'),
    Harvest;

module.exports = Harvest = function (opts) {
    var self = this;

    if (_isUndefined(opts,'subdomain')) {
        throw new Error('The Harvest API client requires a subdomain');
    }

    this.use_oauth = (opts.identifier !== undefined &&
                      opts.secret !== undefined);
    this.use_basic_auth = (opts.email !== undefined &&
                           opts.password !== undefined);

    if (!this.use_oauth && !this.use_basic_auth) {
        throw new Error('The Harvest API client requires credentials for basic authentication or an identifier and secret for OAuth');
    }

    this.subdomain = opts.subdomain;
    this.host = "https://" + this.subdomain + ".harvestapp.com";

    this.redirect_uri = opts.redirect_uri;
    this.email = opts.email;
    this.password = opts.password;
    this.identifier = opts.identifier;
    this.secret = opts.secret;
    this.user_agent = opts.user_agent;
    this.debug = opts.debug || false;
    this.access_token;

    var restService = restler.service(function (u, p, t) {
        if (u) {
          this.defaults.username = u;
        }
        if (p) {
          this.defaults.password = p;
        }
        if (t) {
          this.defaults.access_token = t;
        }

        console.log("Defaults set to", this.defaults);
    }, {
        baseURL: self.host
    }, {
        run: function (type, url, data) {
            if (self.debug) {
                console.log('run', type, url, data);
            }

            var opts = {};
                } else {
                    opts.headers['Content-Length'] = data.length;
                }
            } else {
                opts.headers['Content-Length'] = 0;
            }

            opts.data = data;
            switch (type) {
            case 'get':
                return this.get(url, opts);

            case 'post':
                return this.post(url, opts);

            case 'put':
                return this.put(url, opts);

            case 'delete':
                return this.del(url, opts);
            }
            return this;
        }
    });

    this.processRequest = function (res, cb) {
        if (this.debug) {
            console.log('processRequest', cb);
        }

        if (typeof cb !== "function") {
            throw new Error('processRequest: Callback is not defined');
        }

        res.once('complete', function (data, res) {
            var err;

            if (self.debug) {
                console.log('complete', util.inspect(data, false, 10));
            }

            err = null;

            if (res && res.req.method === "DELETE" && res.statusCode) {
                return cb(err, data);
            }

            if (data instanceof Error || !res || res.statusCode > 399 || data === "Authentication failed for API request.") {
                err = data;
                data = {};
                return cb(err);
            }

            cb(err, data);
        });
    };


    this.getAccessTokenURL = function() {
      return this.host
        + "/oauth2/authorize?client_id=" + this.identifier
        + "&redirect_uri=" + encodeURIComponent(this.redirect_uri)
        + "&response_type=code";
    }

    this.parseAccessToken = function(access_code, cb) {
      var self = this;

      this.access_code = access_code;
      options = {
        "code":          this.access_code,
        "client_id":     this.identifier,
        "client_secret": this.secret,
        "redirect_uri":  this.redirect_uri,
        "grant_type":    "authorization_code"
      }

      restler.post(this.host + '/oauth2/token', {
        data: options
      }).on('complete', function(response) {
        console.log(response.access_token);
        console.log(response.refresh_token);

        self.access_token = response.access_token;

        self.service = new restService(self.email, self.passport, self.access_token);

        cb(self.access_token);
      });
    }

    this.service = new restService(this.email, this.password);

    this.client = {
        get: function (url, data, cb) {
            self.processRequest(self.service.run('get', url, data), cb);
        },
        patch: function (url, data, cb) {
            self.processRequest(self.service.run('patch', url, data), cb);
        },
        post: function (url, data, cb) {
            self.processRequest(self.service.run('post', url, data), cb);
        },
        put: function (url, data, cb) {
            self.processRequest(self.service.run('put', url, data), cb);
        },
        delete: function (url, data, cb) {
            self.processRequest(self.service.run('delete', url, data), cb);
        }
    };

    var Account = require('./lib/account');
    var TimeTracking = require('./lib/time-tracking');
    var Clients = require('./lib/clients');
    var ClientContacts = require('./lib/client-contacts');
    var Projects = require('./lib/projects');
    var Tasks = require('./lib/tasks');
    var People = require('./lib/people');
    var ExpenseCategories = require('./lib/expense-categories');
    var Expenses = require('./lib/expenses');
    var UserAssignment = require('./lib/user-assignment');
    var TaskAssignment = require('./lib/task-assignment');
    var Reports = require('./lib/reports');
    var Invoices = require('./lib/invoices');
    var InvoiceMessages = require('./lib/invoice-messages');
    var InvoicePayments = require('./lib/invoice-payments');
    var InvoiceCategories = require('./lib/invoice-categories');

    this.Account = new Account(this);
    this.TimeTracking = new TimeTracking(this);
    this.Clients = new Clients(this);
    this.ClientContacts = new ClientContacts(this);
    this.Projects = new Projects(this);
    this.Tasks = new Tasks(this);
    this.People = new People(this);
    this.ExpenseCategories = new ExpenseCategories(this);
    this.Expenses = new Expenses(this);
    this.UserAssignment = new UserAssignment(this);
    this.TaskAssignment = new TaskAssignment(this);
    this.Reports = new Reports(this);
    this.Invoices = new Invoices(this);
    this.InvoiceMessages = new InvoiceMessages(this);
    this.InvoicePayments = new InvoicePayments(this);
    this.InvoiceCategories = new InvoiceCategories(this);

    return this;
};

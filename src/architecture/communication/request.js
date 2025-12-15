/**
 * Natural-JS Architecture Request Class
 */

export class Request {
    constructor(comm, options) {
        this.options = options || {};
        this.referrer = window.location.href;
        this.comm = comm;
    }
}

export default Request;

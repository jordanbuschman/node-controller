function base64() {
    this.encodeBase64Url = function(str) {
        return (window.btoa(str)).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
    };
    this.decodeBase64Url = function(str) {
        str = (str + '===').slice(0, str.length + (str.length % 4));
        return window.atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    };
}

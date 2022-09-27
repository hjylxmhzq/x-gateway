import Joi from 'joi';
export var ProxyProtocol;
(function (ProxyProtocol) {
    ProxyProtocol["http"] = "http";
})(ProxyProtocol || (ProxyProtocol = {}));
export var ProxyStatus;
(function (ProxyStatus) {
    ProxyStatus[ProxyStatus["stopped"] = 0] = "stopped";
    ProxyStatus[ProxyStatus["running"] = 1] = "running";
})(ProxyStatus || (ProxyStatus = {}));
export const AddHttpRequestValidator = Joi.object({
    name: Joi.string().min(1).max(30).required(),
    host: Joi.string().min(0).max(200).required(),
    path: Joi.string().required(),
    port: Joi.number().integer().positive().required(),
    proxyHost: Joi.string().min(0).max(200).required(),
    proxyPort: Joi.number().integer().positive().required(),
    proxyProtocol: Joi.string().allow('http'),
});

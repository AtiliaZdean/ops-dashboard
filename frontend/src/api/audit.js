 // all API calls related to audit
 // each function maps to one backend route

 import api from './client'

 // GET /audit - fetch audit logs, optional filters
 export const getAuditLogs = (params) => api.get('/audit/', { params })

 // GET/audit/summary - fetch action counts
 export const getAuditSummary = () => api.get('/audit/summary')

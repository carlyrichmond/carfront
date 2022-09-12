import { init as initApm } from '@elastic/apm-rum'
var apm = initApm({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'carfront',
  // Set the version of your application
  // Used on the APM Server to find the right sourcemap
  serviceVersion: '0.90',
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'https://0ad4a0b4a15c448fa69865ae327ce844.apm.europe-west2.gcp.elastic-cloud.com:443',
  // For distributed tracing to different origin (CORS)
   distributedTracingOrigins: ['http://localhost:8080'],
})

export default apm;
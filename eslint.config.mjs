// Root ESLint — extends the shared preset (@vmd/config/eslint), which carries the
// no-deep-import boundary rule (LAW 2). dependency-cruiser handles graph edges.
import base from './packages/config/eslint/index.js';
export default [...base];

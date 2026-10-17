import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync('app/api/admin/fellows/[id]/access/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const id = '10000000-0000-4000-8000-000000000001';
const context = { params: Promise.resolve({ id }) };
let state;
function reset(patch = {}) {
    state = {
        signedIn: true, admin: true, status: 'active', userId: 'fellow-user', email: 'fellow@example.com',
        accountEmail: 'fellow@example.com', verified: true, existing: null, writes: [], ...patch,
    };
}
const service = {
    auth: { admin: { getUserById: async () => ({ data: { user: { id: state.userId, email: state.accountEmail, email_confirmed_at: state.verified ? '2026-01-01' : null } } }) } },
    from(table) {
        let operation;
        const query = {
            select() { return query; },
            eq() { return operation ? Promise.resolve({ error: null }) : query; },
            async maybeSingle() {
                return { data: table === 'catalyst_fellows' ? { id, user_id: state.userId, email: state.email, full_name: 'Test Fellow', status: state.status } : state.existing };
            },
            update(value) { operation = 'update'; state.writes.push({ table, operation, value }); return query; },
            async insert(value) { state.writes.push({ table, operation: 'insert', value }); return { error: null }; },
        };
        return query;
    },
};
const exports = {};
vm.runInNewContext(source, {
    exports,
    require(name) {
        if (name === 'next/server') return { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } };
        if (name === '@/lib/supabase/server') return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.signedIn ? { id: 'operator' } : null } }) }, rpc: async () => ({ data: state.admin }) }) };
        if (name === '@/lib/fellows/server') return { createFellowsAdminClient: () => service };
        throw new Error(name);
    },
});
const change = (enabled) => exports.PATCH({ json: async () => ({ enabled }) }, context);
for (const [patch, status] of [
    [{ signedIn: false }, 401], [{ admin: false }, 403], [{ userId: null }, 409],
    [{ verified: false }, 409], [{ accountEmail: 'different@example.com' }, 409],
    [{ status: 'inactive' }, 409], [{ userId: 'operator' }, 403],
    [{ existing: { id: 1, role: 'super_admin', is_active: true } }, 403],
]) {
    reset(patch);
    assert.equal((await change(true)).status, status);
    assert.equal(state.writes.length, 0);
}
reset();
assert.equal((await change('yes')).status, 400);
assert.equal(state.writes.length, 0);
assert.equal((await exports.GET({}, context)).body.isAdmin, false);
assert.equal((await change(true)).status, 200);
assert.equal(state.writes[0].value.email, 'fellow@example.com');
assert.equal(state.writes[0].value.role, 'admin');
reset({ existing: { id: 1, role: 'admin', is_active: false } });
assert.equal((await change(true)).body.isAdmin, true);
assert.equal(state.writes[0].operation, 'update');
assert.equal(state.writes[0].value.is_active, true);
reset({ status: 'inactive', existing: { id: 1, role: 'admin', is_active: true } });
assert.equal((await exports.GET({}, context)).body.isAdmin, true);
assert.equal((await change(false)).body.isAdmin, false);
assert.equal(state.writes[0].value.is_active, false);
assert.equal(state.writes[0].value.role, undefined);
console.log('PASS: admin authorization, linked identity, verified email, active fellows, protected accounts, promotion/reactivation and removal.');

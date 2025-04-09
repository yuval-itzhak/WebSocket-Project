import request from 'supertest';
import {server, app} from '../src/server';
import test from 'ava';

test.serial('should fetch all code blocks', async t => {
  const res = await request(app).get('/api/codeBlocks');
  t.is(res.status, 200);
  t.true(Array.isArray(res.body));
});

test.serial('should fetch a code block by ID', async t => {
  const id = '67f3ee938629c19c577dbffd';
  const res = await request(app).get(`/api/codeBlocks/${id}`);
  t.is(res.status, 200);
  t.truthy(res.body); 
});


//need to fail - there isnt Code block with this id
test.serial('should return 404 if code block not found', async t => {
  const res = await request(app).get('/api/codeBlocks/0000000000000000');
  t.is(res.status, 404);
  t.deepEqual(res.body, { message: 'Code block not found' });
});

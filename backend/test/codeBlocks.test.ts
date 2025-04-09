import request from 'supertest';
import {server, app} from '../src/server';
import test from 'ava';

test.serial('should fetch all code blocks', async t => {
  const res = await request(app).get('/api/codeBlocks');
  t.is(res.status, 200);
  t.true(Array.isArray(res.body));
});

test.serial('should fetch a code block by ID - Add Two Numbers', async t => {
  const id = '67f3ee938629c19c577dbffd';
  const res = await request(app).get(`/api/codeBlocks/${id}`);
  t.is(res.status, 200);
  t.truthy(res.body); 
});

test.serial('should fetch a code block by ID - Multiply Two Numbers', async t => {
  const id = '67f4d5a2f9d6d3f3412e85d9';
  const res = await request(app).get(`/api/codeBlocks/${id}`);
  t.is(res.status, 200);
  t.truthy(res.body); 
});

test.serial('should fetch a code block by ID - Subtract Two Numbers', async t => {
  const id = '67f4dff445785e94cb7bc424';
  const res = await request(app).get(`/api/codeBlocks/${id}`);
  t.is(res.status, 200);
  t.truthy(res.body); 
});

test.serial('should fetch a code block by ID - Divide a Number by 10', async t => {
  const id = '67f4f866469c1777048fc0fd';
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

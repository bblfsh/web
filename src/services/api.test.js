import { parse } from './api';

describe('api/parse', () => {
  it('should return the UAST and language when the request is successful', () => {
    fetch.mockResponse(
      JSON.stringify({ uast: 'ok', language: 'python', status: 0 })
    );

    const promise = parse(
      'python',
      'test.py',
      'def sum(a, b):\n  return a + b\n'
    );
    expect(promise).resolves.toEqual({ uast: 'ok', language: 'python' });
  });

  it('should return error when the request is not successful', () => {
    fetch.mockResponse(
      JSON.stringify({
        status: 'error',
        errors: ['nok', { message: 'err' }],
      })
    );

    const promise = parse('python', '', '');
    expect(promise).rejects.toEqual(['nok', 'err']);
  });
});

import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent
} from 'aws-lambda/trigger/api-gateway-authorizer';

export const basicAuthorizer = async (event: APIGatewayTokenAuthorizerEvent
  ): Promise<APIGatewayAuthorizerResult> => {
    console.log('basicAuthorizer is called with: ', event);

    if (event.type !== 'TOKEN') {
      return policy('Deny', event.methodArn);
    }
    try {
      const [, token] = event.authorizationToken.split(' ');

      const [login, password] = Buffer.from(token, 'base64').toString().split(':');

      console.log(`login: ${login}, password: ${password}`);

      if (
        process.env[login] !== undefined &&
        password !== undefined &&
        process.env[login] === password
      ) {
        console.log('Allowed');
        return policy('Allow', event.methodArn, token);
      } else {
        console.log('Denied');
        return policy('Deny', event.methodArn);
      }
    } catch (err) {
      console.log('basicAuthorizer failed with error ', err);
      return policy('Deny', event.methodArn);
    }
}

function policy(
  effect: 'Allow' | 'Deny',
  resource: string,
  principalId = '1'
): APIGatewayAuthorizerResult {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{ Effect: effect, Action: 'execute-api:Invoke', Resource: resource }],
    },
  };
}

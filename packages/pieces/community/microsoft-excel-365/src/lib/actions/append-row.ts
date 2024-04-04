import { createAction, Property } from '@activepieces/pieces-framework';
import {
  httpClient,
  HttpMethod,
  AuthenticationType,
  HttpRequest,
} from '@activepieces/pieces-common';
import { excelAuth } from '../../index';
import { excelCommon } from '../common/common';

export const appendRowAction = createAction({
  auth: excelAuth,
  name: 'append_row',
  description: 'Append row of values to a worksheet',
  displayName: 'Append Row to Worksheet',
  props: {
    workbook_id: excelCommon.workbook_id,
    worksheet_id: excelCommon.worksheet_id,
    first_row_headers: Property.Checkbox({
      displayName: 'Are the First row Headers?',
      description: 'If the first row is headers',
      required: true,
      defaultValue: false,
    }),
    values: excelCommon.values,
  },
  async run({ propsValue, auth }) {
    const workbookId = propsValue['workbook_id'];
    const worksheetId = propsValue['worksheet_id'];
    const values = propsValue.first_row_headers
      ? [Object.values(propsValue['values'])]
      : Object.values(propsValue['values']);

    const lastUsedRow = await excelCommon.getLastUsedRow(
      workbookId,
      worksheetId,
      auth['access_token']
    );
    const lastUsedColumn = excelCommon.numberToColumnName(
      Object.values(values[0]).length
    );

    const rangeFrom = `A${lastUsedRow + 1}`;
    const rangeTo = `${lastUsedColumn}${lastUsedRow + 1}`;

    const url = `${excelCommon.baseUrl}/items/${workbookId}/workbook/worksheets/${worksheetId}/range(address='${rangeFrom}:${rangeTo}')`;

    const formattedValues = values.map((value) =>
      value === '' ? null : value
    );
    const requestBody = {
      values: formattedValues,
    };
    console.log('VALUES');
    console.log(propsValue.values);
    console.log('FORMATTED VALUES');
    console.log(formattedValues);
    const request: HttpRequest = {
      method: HttpMethod.PATCH,
      url: url,
      body: requestBody,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: auth['access_token'],
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await httpClient.sendRequest(request);
    return response.body;
  },
});

const schema = {
  tables: [
    {
      name: 'tests',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'test_type', type: 'string' },
        { name: 'threshold', type: 'integer' },
        { name: 'materialization_address', type: 'string' },
        { name: 'column_name', type: 'string' },
        { name: 'executed_on', type: 'date' },
        { name: 'execution_id', type: 'string' },
      ],
    },
    {
      name: 'test_history',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'test_type', type: 'string' },
        { name: 'value', type: 'float' },
        { name: 'is_anomaly', type: 'boolean' },
        { name: 'user_anomaly_feedback', type: 'string' },
        { name: 'execution_id', type: 'string' },
      ],
    },
    {
      name: 'test_results',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'test_type', type: 'string' },
        { name: 'mean_ad', type: 'float' },
        { name: 'median_ad', type: 'float' },
        { name: 'modified_z_score', type: 'float' },
        { name: 'expected_value', type: 'float' },
        { name: 'expected_value_upper_bound', type: 'float' },
        { name: 'expected_value_lower_bound', type: 'float' },
        { name: 'deviation', type: 'float' },
        { name: 'is_anomalous', type: 'boolean' },
        { name: 'execution_id', type: 'string' },
      ],
    },
    {
      name: 'alerts',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'test_type', type: 'string' },
        { name: 'message', type: 'string' },
        { name: 'execution_id', type: 'string' },
      ],
    },
  ],
};

export default schema;
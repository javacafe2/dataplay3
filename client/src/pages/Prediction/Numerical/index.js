import React, { PureComponent } from 'react';
import { Row, Col, Button, Modal, Empty } from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import MLJobTable from '@/components/Prediction/MLJobTable';
import MLJobControlPanel from '@/components/Prediction/MLJobControlPanel';
import MLJobDetailsPanel from '@/components/Prediction/MLJobDetailsPanel';
import MLJobPredictPanel from '@/components/Prediction/MLJobPredictPanel';
import MLJobOptionCreationPanel from '@/components/Prediction/MLJobOptionCreationPanel';

import styles from './index.less';

@connect(({ regression, loading }) => ({
  regression,
  loading: loading.effects['regression/fetchJobs'],
}))
class Numerical extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'regression/fetchJobs',
    });
    dispatch({
      type: 'regression/fetchDatasets',
    });
    dispatch({
      type: 'regression/fetchConfig',
    });
  }

  render() {
    const { regression, dispatch } = this.props;
    const { jobs, view, selectedJob, datasetList, selectedDataset, config } = regression;
    const jobType = 'AutoRegressionJob';

    const jobConfig = { ...config };
    if (jobConfig && jobConfig.auto_ml_algorithms) {
      delete jobConfig.auto_ml_algorithms['classifiers'];
    }

    const onCreate = () => {
      dispatch({
        type: 'regression/createView',
      });
    };
    const onList = () => {
      dispatch({
        type: 'regression/listView',
      });
    };
    const onDelete = r => {
      Modal.confirm({
        title: 'Do you Want to delete this job?',
        content: `job ${r.name} will be deleted! `,
        onOk() {
          dispatch({
            type: 'regression/deleteJob',
            payload: r.id,
          });
        },
      });
    };

    const onView = r => {
      const payload = {};
      payload.jobId = r.id;
      payload.view = 'detail';
      dispatch({
        type: 'regression/switchView',
        payload: payload,
      });
    };

    const onPredict = r => {
      const payload = {};
      payload.jobId = r.id;
      payload.view = 'predict';
      dispatch({
        type: 'regression/switchView',
        payload: payload,
      });
    };

    const handleDatasetSelection = event => {
      dispatch({
        type: 'regression/fetchDataset',
        payload: event,
      });
    };

    const handelJobCreation = event => {
      event.type = jobType;
      Modal.confirm({
        title: 'Do you Want to create this job?',
        content: `job ${event.name} will be created! `,
        onOk() {
          dispatch({
            type: 'regression/createMLJob',
            payload: event,
          });
        },
      });
    };

    const handleDetailRefresh = id => {
      const payload = {};
      payload.jobId = id;
      payload.view = 'detail';

      dispatch({
        type: 'regression/switchView',
        payload: payload,
      });
    };

    const contentView = () => {
      if (view == 'list') {
        return <MLJobTable jobs={jobs} onView={onView} onDelete={onDelete} onPredict={onPredict} />;
      } else if (view == 'create') {
        return (
          <MLJobOptionCreationPanel
            datasetList={datasetList}
            selectedDataset={selectedDataset}
            onDatasetSelect={handleDatasetSelection}
            onCreate={handelJobCreation}
            jobType={jobType}
            config={config}
          />
        );
      } else if (view == 'detail') {
        return (
          <MLJobDetailsPanel job={selectedJob} onRefresh={handleDetailRefresh} config={jobConfig} />
        );
      } else if (view == 'predict') {
        return <MLJobPredictPanel job={selectedJob} />;
      } else {
        return <Empty />;
      }
    };

    return (
      <PageHeaderWrapper>
        <div className={styles.numerical}>
          <Row>
            <MLJobControlPanel
              canList={true}
              canCreate={true}
              onList={onList}
              onCreate={onCreate}
            />
          </Row>
          <Row>{contentView()}</Row>
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default Numerical;

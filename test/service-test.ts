import { expect } from 'chai';
import {
    AccountConfig,
    ConsumeEventsContext,
    DeployContext,
    PreDeployContext,
    ProduceEventsContext,
    ServiceConfig,
    ServiceContext,
    ServiceEventConsumer,
    ServiceType,
    UnDeployContext
} from 'handel-extension-api';
import { deletePhases, deployPhase } from 'handel-extension-support';
import 'mocha';
import * as sinon from 'sinon';
import { GpuSpotInstanceService } from '../src/service';
import accountConfig from './fake-account-config';

describe('gpuspotinstance service deployer', () => {
    let sandbox: sinon.SinonSandbox;
    let serviceContext: ServiceContext<ServiceConfig>;
    let serviceParams: ServiceConfig;
    const appName = 'FakeApp';
    const envName = 'FakeEnv';
    const serviceName = 'FakeService';
    const serviceType = 'gpuspotinstance';
    const serviceProvisioner = new GpuSpotInstanceService();

    beforeEach(async () => {
        serviceParams = {
            type: serviceType
        };
        serviceContext = new ServiceContext(appName, envName, serviceName, new ServiceType('spot-gpu', serviceType), serviceParams, accountConfig);
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('check', () => {
        it('should test the check phase', () => {
            // const results = serviceProvisioner.check(serviceContext);
            // expect(results).to.deep.equal([]);
        });
    });

    describe('deploy', () => {
        it('should test the deploy phase', async () => {
            // const ownPreDeployContext = new PreDeployContext(serviceContext);

            // const deployContext = await serviceProvisioner.deploy(serviceContext, ownPreDeployContext, []);
            // expect(deployContext).to.be.instanceof(DeployContext);
        });
    });

    describe('unDeploy', () => {
        it('should test the unDeploy phase', async () => {
            // const unDeployContext = await serviceProvisioner.unDeploy(serviceContext);
            // expect(unDeployContext).to.be.instanceof(UnDeployContext);
        });
    });
});

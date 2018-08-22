/*
 * Copyright 2018 David Woodruff
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import {
    DeployContext,
    DeployOutputType,
    PreDeployContext,
    ServiceConfig,
    ServiceContext,
    ServiceDeployer,
    Tags,
    UnDeployContext,
    UnPreDeployContext
} from 'handel-extension-api';
import {
    checkPhase,
    deletePhases,
    deployPhase,
    handlebars,
    preDeployPhase,
    tagging
} from 'handel-extension-support';
import {
    GpuSpotConfig,
    HandlebarsSpotTemplate
} from './config-types';

const SERVICE_NAME = 'GpuSpotInstance';

export class GpuSpotInstanceService implements ServiceDeployer {

    // Set each array to have zero or more output types that this service consumes and produces
    public readonly consumedDeployOutputTypes = [
        DeployOutputType.EnvironmentVariables,
        DeployOutputType.Scripts,
        DeployOutputType.Policies,
        DeployOutputType.Credentials,
        DeployOutputType.SecurityGroups
    ];
    public readonly producedDeployOutputTypes = [];

    // Set this to an instance of ServiceEventType if your service provides any AWS event types (i.e. SNS, Lambda, etc.)
    public readonly providedEventType = null;

    // Set this to have zero or more services that this can produce events to
    public readonly producedEventsSupportedTypes = [];

    // Set this to false if the resources you're deploying don't support tagging
    public readonly supportsTagging = true;

    public check(serviceContext: ServiceContext<GpuSpotConfig>, dependenciesServiceContexts: Array<ServiceContext<ServiceConfig>>): string[] {
        const errors = checkPhase.checkJsonSchema(`${__dirname}/params-schema.json`, serviceContext);
        return errors.map(error => `${SERVICE_NAME} - ${error}`);
    }

    public async preDeploy(serviceContext: ServiceContext<GpuSpotConfig>): Promise<PreDeployContext> {
        return preDeployPhase.preDeployCreateSecurityGroup(serviceContext, 22, SERVICE_NAME);
    }

    public async deploy(ownServiceContext: ServiceContext<GpuSpotConfig>, ownPreDeployContext: PreDeployContext, dependenciesDeployContexts: DeployContext[]): Promise<DeployContext> {
        const stackName = ownServiceContext.stackName();
        console.log(`${SERVICE_NAME} - Deploying GPU instance '${stackName}'`);
        const stackTags = tagging.getTags(ownServiceContext);
        const compiledTemplate = await this.getCompiledTemplate(ownPreDeployContext, ownServiceContext, dependenciesDeployContexts, stackTags);
        const deployedStack = await deployPhase.deployCloudFormationStack(ownServiceContext, stackName, compiledTemplate, [], true, 30, stackTags);
        console.log(`${SERVICE_NAME} - Finished deploying GPU instance '${stackName}'`);
        return new DeployContext(ownServiceContext);
    }

    public async unPreDeploy(ownServiceContext: ServiceContext<GpuSpotConfig>): Promise<UnPreDeployContext> {
        return deletePhases.unPreDeploySecurityGroup(ownServiceContext, SERVICE_NAME);
    }

    public async unDeploy(ownServiceContext: ServiceContext<GpuSpotConfig>): Promise<UnDeployContext> {
        return deletePhases.unDeployService(ownServiceContext, SERVICE_NAME);
    }

    private async getCompiledTemplate(ownPreDeployContext: PreDeployContext, ownServiceContext: ServiceContext<GpuSpotConfig>, dependenciesDeployContexts: DeployContext[], tags: Tags): Promise<string> {
        const accountConfig = ownServiceContext.accountConfig;
        const params = ownServiceContext.params;
        const imageId = await this.getLatestDeepLearningAmi();
        const now = new Date();
        const twoWeeksFromNow = new Date(Date.now() + 12096e5);
        const handlebarsParams: HandlebarsSpotTemplate = {
            appName: ownServiceContext.resourceName(),
            validFrom: now.toISOString(),
            validUntil: twoWeeksFromNow.toISOString(), // Two weeks from now
            instanceType: 'p2.xlarge',
            imageId,
            keyName: params.key_name,
            volumeSize: params.volume_size || 75,
            securityGroupId: ownPreDeployContext.securityGroups[0].GroupId!,
            subnetId: accountConfig.public_subnets[0],
            userData: 'dG91Y2ggL2hvbWUvZWMyLXVzZXIvaGVsbG8udHh0',
            tags,
            policyStatements: deployPhase.getAllPolicyStatementsForServiceRole(ownServiceContext, [], dependenciesDeployContexts, true)
        };
        return handlebars.compileTemplate(`${__dirname}/spot-template.yml`, handlebarsParams);
    }

    private async getLatestDeepLearningAmi() {
        return 'ami-0faada77';
    }
}

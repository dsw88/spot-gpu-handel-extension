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
import { ServiceConfig, Tags } from 'handel-extension-api';

export interface GpuSpotConfig extends ServiceConfig {
    key_name: string;
    volume_size?: number;
}

export interface HandlebarsSpotTemplate {
    appName: string;
    validFrom: string;
    validUntil: string;
    instanceType: string;
    imageId: string;
    keyName: string;
    volumeSize: number;
    securityGroupId: string;
    subnetId: string;
    userData: string;
    tags: Tags;
    policyStatements: any;
}

import _ from 'lodash';
import { join } from 'path';
import { existsSync, mkdirsSync, writeFileSync, readFileSync } from 'fs-extra';
import { camelCase } from '../utils';
import reduxReset from './reduxReset';
import render from '../utils/mustache';
import resetIndex from './resetIndex';

export default (config, opts) => {
    const name = _.upperFirst(camelCase(opts.name));
    const camelCaseName = camelCase(name);
    opts.camelCaseName = camelCaseName;
    const componentPath = join(config.dir, config.directory.source, config.directory.component, name);
    mkdirsSync(componentPath);
    const vdConfigPath = join(config.dir, '.vd', 'components');
    mkdirsSync(vdConfigPath);

    writeFileSync(join(componentPath, 'index.js'),
        render('component/index.mustache',
            { name: name })
    );

    const module = {};
    _.forEach(opts.module, (item) => {
        module[item] = camelCaseName;
        if (item !== 'style' && item !== 'doc') {
            mkdirsSync(join(componentPath, config.directory[item] || item));
        }
    });

    if (module.style) {
        const stylePath = join(componentPath, config.directory.style);
        mkdirsSync(stylePath);
        writeFileSync(join(stylePath, `${camelCaseName}.less`), '');
    }
    if (module.doc) {
        const docPath = join(componentPath, config.directory.document);
        mkdirsSync(docPath);
        writeFileSync(join(docPath, 'index.md'), `${name} Doc`);
    }

    const lifecycle = {};
    const firstLoad = [];

    _.forEach(opts.lifecycle, (item) => lifecycle[item] = true);

    writeFileSync(join(componentPath, `${name}.js`),
        render('component/component.mustache', {
            ...opts,
            lifecycle,
            firstLoad: firstLoad.join(';\n'),
            module
        })
    );


    if (opts.saga) {
        const apiPath = join(config.dir, config.directory.source, config.directory.config, 'api.js');
        let apiContent = readFileSync(apiPath, 'utf8');
        apiContent = apiContent.replace('export default', '').replace(';', '');
        apiContent = JSON.parse(apiContent);
        apiContent[opts.saga.requestVarName] = opts.saga.url;
        writeFileSync(apiPath, `export default ${JSON.stringify(apiContent, null, 2)};`);

        const routePath = join(config.dir, config.directory.source, 'routes');
        if (!existsSync(routePath)) {
            mkdirsSync(routePath);
        }
        writeFileSync(join(routePath, `${camelCaseName}.js`),
            render('route.mustache',
                {
                    name,
                    ...opts.saga
                })
        );
        const servicePath = join(config.dir, config.directory.source, 'services');
        if (!existsSync(servicePath)) {
            mkdirsSync(servicePath);
        }
        writeFileSync(join(servicePath, `${camelCaseName}.js`),
            render('services.mustache',
                {
                    name,
                    ...opts.saga
                })
        );

        const modelPath = join(config.dir, config.directory.source, 'models');
        if (!existsSync(modelPath)) {
            mkdirsSync(modelPath);
        }
        writeFileSync(join(modelPath, `${camelCaseName}.js`),
            render('model.mustache',
                {
                    name,
                    camelCaseName
                })
        );
    }

    writeFileSync(join(vdConfigPath, `${camelCaseName}.json`), JSON.stringify(opts, null, 2));
}
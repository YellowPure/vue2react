import template from '@babel/template';
import * as t from '@babel/types';
import { formatComponentName } from './utils/tools';

import { App } from './utils/types'

export default function reactTemplateBuilder(app: App) {
  const componentTemplate = `
    export default class NAME extends Component {
      constructor(props) {
        super(props);
        this.state=STATE;
        REFS
      }
    }
  `;

  const buildRequire = template(componentTemplate);
  const refs = app.template.refs.map(ref => t.expressionStatement(t.assignmentExpression('=', 
    t.memberExpression(t.thisExpression(), t.identifier(ref)), 
    t.callExpression(t.memberExpression(t.identifier('React'), t.identifier('createRef')), [])
  )));

  const defaultClass = t.exportDefaultDeclaration(
    t.classDeclaration(t.identifier(formatComponentName(app.script.name)), 
      t.identifier('Component'),
      t.classBody([t.classMethod('constructor', 
        t.identifier('constructor'),
        [t.identifier('props')],
        t.blockStatement([
          t.expressionStatement(
            t.callExpression(t.identifier('super'), [t.identifier('props')])
          ),
          t.expressionStatement(
            t.assignmentExpression('=', 
              t.memberExpression(
                t.thisExpression(),
                t.identifier('state')
              ),
              t.objectExpression(app.script.data._statements)
            )
          ),
          ...refs
        ])
        )])));
    
  // const node = buildRequire({
  //   NAME: t.identifier(formatComponentName(app.script.name)),
  //   STATE: t.objectExpression(app.script.data._statements),
  //   REFS: t.blockStatement( refs)
  // });
  console.log('NAME extends Component')
  return t.file(t.program([defaultClass as any]));
}

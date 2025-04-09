import { NodeVM } from 'vm2';

//function to execute student code in a sandboxed environment (isolated environment)
export const evaluateCode = async (
  code: string,
  functionParameters: any[],
  functionName: string
): Promise<any> => {
  try {

    //wraps the student’s code so that it can be used and executed inside the vm2
    const wrappedCode = `
      ${code}
      module.exports = ${functionName};
    `;

    const vm = new NodeVM({
      console: 'inherit',
      sandbox: {},
      require: false,
    });

    //run the code inside the VM and get the exported function
    const runFunction = vm.run(wrappedCode, 'vm.js');
    const result = await runFunction(...functionParameters);
    return result;
    
    //As long as the code student is not correct or valid, the program will end here
  } catch (error: any) {
    return { error: 'Error evaluating student code.' };
  }
};

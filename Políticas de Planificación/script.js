var simProcessList = [];
var variableSim = {};
var setID = 1;
var processes = [];
var currentProcess = {};
var stateSim = 'Ready';
var timeSimulationValues = {
    'instruction': 150,
    'change': 1200
};
var realTimeExecution = 0

// Variables simulacion
function getParameters(){
    
    inputSimCapacidad = document.getElementById('inputSimCapacidad').value;
    inputSimInstruccion = document.getElementById('inputSimInstruccion').value;
    inputSimIntercambio = document.getElementById('inputSimIntercambio').value;
    inputSimPolitica = document.getElementById('inputSimPolitica').value;
    inputSimQuantum = document.getElementById('inputSimQuantum').value;
      
    variableSim = {
        'capacidad': parseInt(inputSimCapacidad),
        'velocidad': parseFloat(inputSimInstruccion),
        'tiempoIntercambio': parseFloat(inputSimIntercambio),
        'politica': inputSimPolitica,
        'quantum': parseInt(inputSimQuantum)
    }

}



// Agregar Proceso
function addInstruction(){
    addProcessInput = document.getElementById('add-process-input');
    value = parseInt(addProcessInput.value);
    if(value>0){
        process = createProcess(value);
        processes.push(process);

        renderProcessParam();
        addProcessInput.value = '';
    }
}

function createProcess(value){
    return {
        id:setID++,
        instructions:value,
        valuePolite:0
    };
}

function removeProcess(processID){
    processes = processes.filter( process => process.id != processID);
    renderProcessParam();
}


function renderProcessParam(){
    processParamsVisual = document.getElementById('processParamsVisual');
    processParamsVisual.innerHTML = ' ';
    
    processes.map( process => {
        processParamsVisual.innerHTML += `
            <div class="process" id="process-${process.id}">
                <div class="white-space">
                    <div class="instruction-seg">
                        <div class="instructions-left">${process.instructions}</div>     
                        <div class="instruction-remove" onclick="removeProcess(${process.id})">x</div>
                    </div>
                </div>
            </div>        
        `
    });
}

//Simulación visual

async function startSimulation(){
    simProcessList = JSON.parse(JSON.stringify(processes));
    getParameters();
    calculateValues();
    setCurrentProcess();
    calculateValues();
    renderVisualSimul();
    setStateSim('Wait');
    
    while(stateSim != 'Ready'){
        
        if(stateSim == 'Wait'){
            await executeProcess()   
        }
        if(stateSim == 'Change'){
            setCurrentProcess();
            calculateValues();
            realTimeExecution += variableSim.tiempoIntercambio;
            await sleep(timeSimulationValues.change);
            setStateSim('Wait');
            renderVisualSimul();
        }
    } 
}


async function executeProcess(){
    if(currentProcess.instructions > 0){
        currentProcess.instructions -= 1;
        renderVisualSimul();
        realTimeExecution += variableSim.velocidad;
        await sleep(timeSimulationValues.instruction);
    }
    else{
        if(simProcessList.length > 0){
            setStateSim('Change');
            renderVisualSimul();
        }
        else{
            setCurrentProcess();
            setStateSim('Ready');
            renderVisualSimul();
            renderResults();
            realTimeExecution = 0;
        }
    }
}


function calculateValues(){
    
    switch (variableSim.politica){
        case 'FCFS':
            calculateFCFS();
            break;

        case 'Round': 
            calculateRR();
            break;

        case 'SPN':
            break;

        case 'HRRN':
            break;
    }
}

function calculateFCFS(){
    simProcessList.map( (process, index) => {
        process.valuePolite = index + 1
    })
}

function renderVisualSimul(){
    renderProcessQueue();
    renderCurrentProcess();
}

function renderProcessQueue(){
    processContainerSim = document.getElementById('process-container-sim');
    processContainerSim.innerHTML = " ";
    simProcessList.map( process => {

        processContainerSim.innerHTML += `
            <div class="process" id="process-sim-${process.id}">
                <div class="white-space">
                    <div class="instruction-seg">
                        <div class="instructions-left">${process.instructions}</div>
                        <div class="instruction-ratio">${process.valuePolite}</div>
                    </div>
                </div>
            </div>    
        `
    });
}

function renderCurrentProcess(){
    currentProcessContainer = document.getElementById('current-process-container');
    if(currentProcess){
        currentProcessContainer.innerHTML = `
            <div class="process" id="process-sim-${currentProcess.id}">
                <div class="white-space">
                    <div class="instruction-seg">
                        <div class="instructions-left">${currentProcess.instructions}</div>
                    </div>
                </div>
            </div>
        `
    }
    else{
        currentProcessContainer.innerHTML = " "
    }
   
}

function renderResults(){
    resultSegment = document.getElementById('resultSegment');
    resultSegment.innerHTML = `
        <h1>Resultados</h1>
        <div class="executionDiv">
            <h3>El tiempo total real de ejecución fue de: ${realTimeExecution.toFixed(2)} segundos</h3>
        </div>
    `
}

function setCurrentProcess(){
    currentProcess = simProcessList.shift();
}

//State 

function setStateSim(state){
    stateSim = state;
    changeCpuIcon(state);
}

function changeCpuIcon(iconName){
    imageComp = document.getElementById('state-image-comp');
    
    switch (iconName){
        case 'Ready':
            imageComp.innerHTML = '<img src="./Assets/checked.png" alt="">'
            break;
        case 'Wait':
            imageComp.innerHTML = '<img src="./Assets/wait.png" alt="">'
            break;
        case 'Change':
            imageComp.innerHTML = '<img src="./Assets/change.png" alt="">'
            break;
    }
} 

//Extra simulation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
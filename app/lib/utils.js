//A place for any functions that aren't CRUD operations. Any data processing, summarizing or general computing stuff goes here.
export async function generateYAxis(tally){
        // Calculate what labels we need to display on the y-axis
        const yAxisLabels = [];

        const topLabel = Math.max(...tally);

        for (let i = topLabel; i >= 0; i -= 10) {
          yAxisLabels.push(`${i} messages`);
        }
      
        return { yAxisLabels, topLabel };
      
};
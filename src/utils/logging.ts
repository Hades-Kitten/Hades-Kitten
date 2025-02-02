//Imports
import chalk from "chalk"
/**
 * Logs messages with timestamp to the console and writes them to a log file.
 * @param {string} message - The log message to be displayed.
 * @param {("ERROR"|"WARNING"|"INFO"|"DATABASE STATUS")} [logLevel=INFO] - The log level. Possible values: "ERROR", "WARNING", "INFO".
 */
function logMessage(message: string, logLevel = "INFO") {
    const timestamp = new Date().toLocaleString()
    const formattedMessage = `[${timestamp}] [${logLevel}] ${message}`;
    // Log to the console with different colors based on the log level
    switch (logLevel) {
        case "ERROR":
            console.error(chalk.red(formattedMessage));
            break;
        case "WARNING":
            console.warn(chalk.yellow(formattedMessage));
            break;
        case "INFO":
            console.log(chalk.cyan(formattedMessage));
            break;
        case "DATABASE STATUS":
            console.log(chalk.magentaBright(formattedMessage));
            break;
        default:
            console.log(formattedMessage);
    }
}
// Example usage:
// logMessage("This is an info message.", "INFO");
// logMessage("This is a warning message.", "WARNING");
// logMessage("This is an error message.", "ERROR");
// logMessage("This is a message with the default log level.");
export default logMessage;
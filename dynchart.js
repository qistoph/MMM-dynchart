/* global Module */

/* Magic Mirror
 * Module: dynchart
 *
 * By Chris van Marle
 * MIT Licensed.
 */

Module.register("dynchart",{

	// Default module config.
	defaults: {
	},

	getScripts: function() {
		return ["moment.js", "Chart.js"];
	},

	start: function() {
		this.dataid = 0;

		this.chartData = {
			labels: [],
			datasets: []
		}

		var self = this;
		this.refInterval = window.setInterval(function() {
			var sample = self.config.samples[self.dataid];

			self.chartData.labels.push(sample[0]);
			for(var i=0; i<sample.length - 1; ++i) {
				if(i >= self.chartData.datasets.length) {
					self.chartData.datasets.push([]);
				}
				self.chartData.datasets[i].push(sample[i + 1]);
			}
			self.updateChartData();

			if(++self.dataid >= self.config.samples.length) {
				window.clearInterval(self.refInterval);
			}
		}, 200);
	},

	updateChartData: function() {
		if(this.myChart !== undefined) {
			this.myChart.data.labels = this.chartData.labels;
			for(var i=0; i<this.myChart.data.datasets.length && i<this.chartData.datasets.length; ++i) {
				this.myChart.data.datasets[i].data = this.chartData.datasets[i];
			}
			this.myChart.update();
		}
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		this.ctx = document.createElement("canvas");
		wrapper.appendChild(this.ctx);

		this.myChart = new Chart(this.ctx, {
			type: "line",
			data: {
				labels: [],
				datasets: [{
					label: "Gewicht",
					yAxisID: "y-axis-0",
					borderColor: "rgba(255, 255, 255, 1)",
					backgroundColor: "rgba(255, 255, 255, 1)",
					fill: false,
					data: [],
				},
				{
					label: "Vet",
					yAxisID: "y-axis-1",
					borderColor: "rgba(153, 153, 153, 1)",
					backgroundColor: "rgba(153, 153, 153, 1)",
					fill: false,
					data: []
				}]
			},
			options: {
				responsive: true,
				legend: {
					display: false
				},
				tooltips: {
					mode: "x",
					callbacks: {
						title: function(ti, data) {
							return moment(ti[0].xLabel).format("MMM \'YY");
						},
						label: function(ti, data) {
							if (ti.datasetIndex == 0) {
								return data.datasets[ti.datasetIndex].data[ti.index] + " kg";
							} else if(ti.datasetIndex == 1) {
								return data.datasets[ti.datasetIndex].data[ti.index] + " %";
							} else {
								return data.datasets[ti.datasetIndex].data[ti.index].toString();
							}
						}
					}
				},
				elements: {
					point: {
						radius: 0,
						hitRadius: 6,
						hoverRadius: 6,
					}
				},
				scales: {
					xAxes: [{
						type: "time",
						time: {
							unit: "month",
							//unit: "quarter",
							displayFormats: {
								month: "MMM \'YY"
							},
						},
						gridLines: {
							color: "rgba(255, 255, 255, 0.1)"
						}
					}],
					yAxes: [{
						position: "left",
						id: "y-axis-0",
						scaleLabel: {
							display: false,
							labelString: "kg"
						},
						gridLines: {
							color: "rgba(255, 255, 255, 0.1)"
						},
						ticks: {
							fontColor: "rgba(255, 255, 255, 1)",
							callback: function(val) {
								return val + " kg";
							}
						}
					},
					{
						position: "right",
						id: "y-axis-1",
						scaleLabel: {
							display: false,
							labelString: "vet"
						},
						gridLines: {
							color: "rgba(255, 255, 255, 0.1)"
						},
						ticks: {
							fontColor: "rgba(255, 255, 255, 0.6)",
							callback: function(val) {
								return val + "%";
							}
						}
					}]
				}
			}
		});

		this.updateChartData();

		return wrapper;
	}
});
